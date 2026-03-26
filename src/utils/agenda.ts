import Agenda, { Job } from "agenda";
import Thread from "../models/thread";
import mongoose from "mongoose";
import { sendEmailWithThread, getThreadMessages } from "./emailService";

const GREEN_COLOR = "\x1b[32m";
const YELLOW_COLOR = "\x1b[33m";
const RED_COLOR = "\x1b[31m";
const RESET_COLOR = "\x1b[0m";

const BOT_EMAIL_MAP: { [key: string]: string } = {
  cr: "dhruvjalan0202@gmail.com",
  eclub: "dhruvjalan0202@gmail.com",
};

interface EmailJobData {
  to: string[];
  from: string;
  subject: string;
  content: string;
  threadId?: string;
  pocId?: string;
  isWelcomeEmail?: boolean;
  messageId?: string;
  scheduledTime?: string;
  totalEmails?: number;
  vertical?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: { name: string; url?: string }[];
}

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecell",
    collection: "agendaJobs",
  },
  processEvery: "30 seconds",
  defaultLockLifetime: 60000,
});

const isJobOnTime = async (job: Job<EmailJobData>): Promise<boolean> => {
  const { scheduledTime } = job.attrs.data;
  const { name, _id } = job.attrs;

  if (!scheduledTime) {
    console.warn(
      YELLOW_COLOR,
      `⚠️ Job ${name} (ID: ${_id}) has no 'scheduledTime' data. Running anyway.`,
      RESET_COLOR
    );
    return true;
  }

  try {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diffMilliseconds = now.getTime() - scheduled.getTime();

    if (diffMilliseconds < 0) {
      console.warn(
        YELLOW_COLOR,
        `RETRYING: Job ${name} (ID: ${_id}) is running >30s early.`,
        RESET_COLOR
      );
      console.warn(
        YELLOW_COLOR,
        ` 	Scheduled for: ${scheduled.toISOString()}, Running at: ${now.toISOString()}. Will retry later.`,
        RESET_COLOR
      );
      return false;
    }

    console.log(
      GREEN_COLOR,
      `Processing job ${name} (ID: ${_id}).`,
      `Scheduled: ${scheduled.toISOString()}, Running: ${now.toISOString()}`,
      RESET_COLOR
    );
    return true;
  } catch (error) {
    console.error(
      RED_COLOR,
      `❌ Error checking job time for ${name} (ID: ${_id}):`,
      error,
      RESET_COLOR
    );
    return false;
  }
};

export const cancelJobsByPocId = async (pocId: string): Promise<number> => {
  try {
    const jobs = await agenda.jobs({
      "data.pocId": pocId,
      nextRunAt: { $exists: true },
    });

    let cancelledCount = 0;
    for (const job of jobs) {
      await job.remove();
      cancelledCount++;
    }

    console.log(
      `Cancelled ${cancelledCount} jobs for POC ID: ${pocId}`
    );
    return cancelledCount;
  } catch (error) {
    console.error(RED_COLOR, "❌ Error cancelling jobs:", error, RESET_COLOR);
    throw error;
  }
};

agenda.define("create email thread", async (job: Job<EmailJobData>) => {
  console.log("in create email thread job...");

  const {
    to,
    from,
    subject,
    content: encodedContent,
    pocId,
    totalEmails,
    vertical,
    cc,
    bcc,
    attachments,
  } = job.attrs.data;
  const content = Buffer.from(encodedContent, "base64").toString("utf-8");
  const toRecipients = to.join(",");

  try {
    const result = await sendEmailWithThread(
      toRecipients,
      subject,
      content,
      undefined,
      undefined,
      `${from}`,
      vertical,
      cc,
      bcc,
      attachments
    );

    if (!result.threadId) {
      throw new Error("No threadId returned from Gmail API");
    }

    const uniqueThreadKey = `${to[0]}-${pocId}-${Date.now()}`;

    try {
      console.log("NEW AGENDA WITH FLATTENING");
      await Thread.create({
        email: [...to, ...(cc || []), ...(bcc || [])],
        threadId: result.threadId,
        messageId: result.id,
        pocId: pocId,
        subject: subject,
        initialContent: content,
        threadKey: uniqueThreadKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        sent_emails: 1,
        totalEmailsInSequence: totalEmails,
      });

      console.log(
        GREEN_COLOR,
        "✅ Created new thread for",
        toRecipients,
        "with threadId:",
        result.threadId,
        "MessageID: ",
        result.id,
        RESET_COLOR
      );
    } catch (dbError: any) {
      console.error(
        RED_COLOR,
        "❌ Error saving thread to database:",
        dbError,
        RESET_COLOR
      );
      throw dbError;
    }

    console.log(
      GREEN_COLOR,
      `✅ Job ${job.attrs.name} (ID: ${job.attrs._id}) processed. Removing from queue.`,
      "Total in Sequence: ",
      totalEmails,
      RESET_COLOR
    );
    await job.remove();
  } catch (error) {
    console.error(
      RED_COLOR,
      `❌ Error in job ${job.attrs.name} (ID: ${job.attrs._id}):`,
      error,
      RESET_COLOR
    );
    throw error;
  }
});

agenda.define("send scheduled email", async (job: Job<EmailJobData>) => {
  console.log("Running send scheduled mail...");

  const {
    to,
    from,
    subject,
    content: encodedContent,
    threadId,
    pocId,
    messageId,
    vertical,
    cc,
    bcc,
    attachments,
  } = job.attrs.data;
  const content = Buffer.from(encodedContent, "base64").toString("utf-8");
  const labelName = `${from}`;
  const toRecipients = to.join(",");
  const toRecipientsDisplay = to.join(", ");

  try {
    let threadIdToSend = threadId;
    let messageIdToSend = messageId;

    if (!threadIdToSend && pocId) {
      const existingThread = await Thread.findOne({
        pocId: pocId,
        email: { $in: to },
      }).sort({ updatedAt: -1 });

      if (existingThread) {
        console.log(
          GREEN_COLOR,
          "✅ Found existing thread in DB:",
          existingThread.threadId,
          RESET_COLOR
        );
        threadIdToSend = existingThread.threadId;
        messageIdToSend = existingThread.messageId;
      } else {
        console.warn(
          YELLOW_COLOR,
          `⚠️ Thread not found for POC ${pocId}. Welcome email may be pending. Retrying job.`,
          RESET_COLOR
        );
        throw new Error(`Thread not found for pocId ${pocId}. Retrying.`);
      }
    }

    if (!threadIdToSend || !pocId) {
      throw new Error("Missing threadId or pocId, cannot proceed.");
    }
      console.log(
        `Checking for replies in thread ${threadIdToSend} before sending...`
      );

    


        const messages = await getThreadMessages(threadIdToSend, vertical);
        console.log(`Got ${messages.length} messages.`);
        
        let hasReply = false;
        let managerSender;
        
        for (let i = 0; i < messages.length; i++) {
            const headers = messages[i]?.payload?.headers;
            if (!headers) {
                console.log(`Message ${i} has no payload or headers.`);
                continue;
            }

            const fromHeader = headers.find(
                (h: any) => h.name.toLowerCase() === 'from'
            );

            if (!fromHeader || !fromHeader.value) {
                console.log(`Message ${i} has no 'From' header.`);
                continue;
            }

            const fromAddress = fromHeader.value;
            console.log(`Message ${i} From:`, fromAddress);
            if(i===0){
                managerSender = fromAddress;
            }

            else if (managerSender){
            const isFromManager = fromAddress.includes(from);
            const isFromBot = fromAddress.includes(managerSender);

            if (!isFromManager && !isFromBot) {
                console.log(YELLOW_COLOR, `Found reply from: ${fromAddress}`, RESET_COLOR);
                hasReply = true;
                break;
            }}
        }

        if (hasReply) {
          console.log(
            YELLOW_COLOR,
            `🔔 REPLY DETECTED in thread ${threadIdToSend} for POC ${pocId}. Cancelling sequence.`,
            RESET_COLOR
          );

          const cancelledCount = await cancelJobsByPocId(pocId);
          console.log(
            `Cancelled ${cancelledCount} future jobs for POC ${pocId}.`
          );
          
          await Thread.deleteOne({ threadId: threadIdToSend });
          console.log(
            YELLOW_COLOR,
            `🗑️ Removed Thread ${threadIdToSend} from database.`,
            RESET_COLOR
          );

          const notificationSubject = `[REPLY] Email Sequence Halted for ${toRecipientsDisplay}`;
          const notificationContent = `<p>Hi,</p>
           <p>A reply was detected in the email thread with <b>${toRecipientsDisplay}</b> </p>
           <p>The automated email sequence has been stopped, <b>${cancelledCount} pending ${cancelledCount==1?"email":"emails"}</b> were cancelled.</p>
           <p>Please review the replied mail and take manual action.</p>`;

          await sendEmailWithThread(
            from,
            notificationSubject,
            notificationContent,
            undefined,
            undefined,
            labelName,
            vertical,
            [],[]
          );

          console.log(`Sent notification email to manager: ${from}`);

          await job.remove();
          console.log(
            `Removed current job ${job.attrs._id} from queue.`
          );
          return;
        }
      
    

    console.log(
      GREEN_COLOR,
      `No replies found. Proceeding to send email to ${toRecipients}.`,
      RESET_COLOR
    );

    const result = await sendEmailWithThread(
      toRecipients,
      subject,
      content,
      threadIdToSend,
      messageIdToSend,
      labelName,
      vertical,
      cc,
      bcc,
      attachments
    );

    if (!result || !result.threadId || !result.id) {
      throw new Error(
        "Failed to send email or did not receive threadId/id"
      );
    }

    const updatedThread = await Thread.findOneAndUpdate(
      { threadId: result.threadId },
      {
        $set: { updatedAt: new Date() },
        $inc: { sent_emails: 1 },
      },
      { upsert: false, new: true }
    );

    if (!updatedThread) {
      console.warn(
        YELLOW_COLOR,
        `⚠️ Thread ${result.threadId} was not found for update (likely already deleted by reply detection).`,
        RESET_COLOR
      );
    } else {
      console.log(
        GREEN_COLOR,
        "✅ Email sent. Thread state updated for threadId:",
        result.threadId,
        RESET_COLOR
      );
    }

    console.log(
      GREEN_COLOR,
      `✅ Job ${job.attrs.name} (ID: ${job.attrs._id}) completed successfully. Removing from queue.`,
      RESET_COLOR
    );
    await job.remove();
  } catch (error) {
    console.error(
      RED_COLOR,
      `❌ Error in job ${job.attrs.name} (ID: ${job.attrs._id}):`,
      error,
      RESET_COLOR
    );
    throw error;
  }
});

export const startAgenda = async () => {
  try {
    await agenda.start();
    console.log(GREEN_COLOR, "✅ Agenda scheduler started", RESET_COLOR);
    return true;
  } catch (error) {
    console.warn(
      YELLOW_COLOR,
      "⚠️ Agenda failed to start (MongoDB may be down), but server will continue",
      RESET_COLOR
    );
    console.error("Agenda error:", (error as Error).message);
    return false;
  }
};

export const stopAgenda = async (): Promise<void> => {
  try {
    await agenda.stop();
    console.log(YELLOW_COLOR, "🛑 Agenda scheduler stopped", RESET_COLOR);
  } catch (error) {
    console.error(RED_COLOR, "❌ Error stopping agenda:", error, RESET_COLOR);
    throw error;
  }
};

export const cancelAllJobs = async (): Promise<number> => {
  try {
    const jobs = await agenda.jobs({
      nextRunAt: { $exists: true },
    });

    let cancelledCount = 0;
    for (const job of jobs) {
      await job.remove();
      cancelledCount++;
    }

    console.log(`Cancelled ${cancelledCount} jobs`);
    return cancelledCount;
  } catch (error) {
    console.error(
      RED_COLOR,
      "❌ Error cancelling all jobs:",
      error,
      RESET_COLOR
    );
    throw error;
  }
};

export { agenda };