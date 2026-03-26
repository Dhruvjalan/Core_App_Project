// Import all the models we created earlier
const E21Student = require('../models/E21Student');
const E21Team = require('../models/E21Team');
const IFStudent = require('../models/IFStudent');
const MeetupUser = require('../models/MeetupUser');
const TeamupParticipant = require('../models/TeamupParticipant');

// Helper function to pick the right model based on the dropdown
const getModel = (dbName) => {
  switch (dbName) {
    case 'e21-students': return E21Student;
    case 'e21-teams': return E21Team;
    case 'if_students': return IFStudent;
    case 'meetupusers': return MeetupUser;
    case 'teamupparticipants': return TeamupParticipant;
    default: return null;
  }
};

exports.searchRecords = async (req, res) => {
    console.log("Searching records with filters:", req.body);
  try {
    const { dbName, filters } = req.body;
    
    const Model = getModel(dbName);
    if (!Model) {
      return res.status(400).json({ message: "Invalid database selected" });
    }

    const activeFilters = {};

    for (const key in filters) {
      let value = filters[key];
      if(typeof value === 'string') {
        value = value.trim();
        filters[key] = value;
      }

      // Skip empty searches
      if (value === '' || value === null || value === undefined) continue;

      // Check the schema to see what type this field is
      const pathType = Model.schema.path(key);

      if (pathType instanceof require('mongoose').Schema.Types.Number) {
        // If it's a Number field, try to convert the search string to a real number
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          activeFilters[key] = numValue;
        }
        // If it's not a valid number (like someone typed "abc" in the phone box), 
        // we just skip this filter so it doesn't crash.
      } 
      else if (typeof value === 'string') {
        // If it's a String field, keep the cool case-insensitive partial search
        activeFilters[key] = { $regex: value, $options: 'i' };
      } 
      else {
        // Booleans or other types
        activeFilters[key] = value;
      }
    }

    const records = await Model.find(activeFilters).limit(50);
    console.log(`Found ${records.length} records matching filters.`);
    console.log("Sample record:", records[0]);
    res.status(200).json(records);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server error while searching records" });
  }
};