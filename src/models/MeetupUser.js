const mongoose = require('mongoose');

const MeetupUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  phoneNumber: { type: Number },
  linkedInID: { type: String },
  definesYouBest: { type: String },
  pincode: { type: Number },
  startupName: { type: String },
  industryName: { type: String },
  startupWebsite: { type: String },
  whereWillYouAttendMeetup: { type: String },
  Isyourstartuprevenuegenerating: { type: String },
  Isyourstartupbasedin: { type: String },
  investinderOrNot: { type: String }
});

module.exports = mongoose.model('MeetupUser', MeetupUserSchema, 'meetupusers');