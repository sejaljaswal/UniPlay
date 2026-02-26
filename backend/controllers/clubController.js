const Club = require('../models/Club');
const User = require('../models/User');
const Organizer = require('../models/Organizer');

// GET /clubs?search=query
exports.getClubs = async (req, res) => {
  console.log('Entered getClubs controller');
  try {
    console.log('GET /clubs?search=', req.query.search);
    const search = req.query.search || '';
    const regex = new RegExp(search, 'i');
    const clubs = await Club.find({ name: { $regex: regex } });
    console.log('Found clubs:', clubs);
    
    // Check if user or organizer is logged in
    let userClubs = [];
    let isOrganizer = false;
    
    if (req.user) {
      try {
        console.log('User ID:', req.user.id);
        const user = await User.findById(req.user.id);
        console.log('Fetched user:', user);
        if (user && user.clubs) {
          userClubs = user.clubs.map(id => id.toString());
          console.log('User clubs:', userClubs);
        } else {
          console.log('User or user.clubs is undefined');
        }
      } catch (userErr) {
        console.error('Error fetching user or mapping clubs:', userErr);
      }
    } else if (req.organizer) {
      try {
        console.log('Organizer ID:', req.organizer.id);
        const organizer = await Organizer.findById(req.organizer.id);
        console.log('Fetched organizer:', organizer);
        if (organizer && organizer.clubs) {
          userClubs = organizer.clubs.map(id => id.toString());
          isOrganizer = true;
          console.log('Organizer clubs:', userClubs);
        } else {
          console.log('Organizer or organizer.clubs is undefined');
        }
      } catch (organizerErr) {
        console.error('Error fetching organizer or mapping clubs:', organizerErr);
      }
    }
    
    const clubsWithMeta = clubs.map(club => {
      let membersCount = 0;
      try {
        membersCount = Array.isArray(club.members) ? club.members.length : 0;
      } catch (e) {
        console.error('Error getting membersCount for club', club, e);
      }
      return {
        _id: club._id,
        name: club.name,
        icon: club.icon,
        membersCount,
        joined: userClubs.includes(club._id.toString()),
      };
    });
    console.log('clubsWithMeta:', clubsWithMeta);
    res.json(clubsWithMeta);
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /clubs/join { clubId }
exports.joinClub = async (req, res) => {
  try {
    console.log('joinClub called');
    const { clubId } = req.body;
    
    if (req.user) {
      // User joining club
      const userId = req.user.id;
      console.log('User joining - userId:', userId, 'clubId:', clubId);
      const club = await Club.findById(clubId);
      console.log('Fetched club:', club);
      if (!club) return res.status(404).json({ message: 'Club not found' });
      if (!club.members.includes(userId)) {
        club.members.push(userId);
        await club.save();
        console.log('Added user to club.members and saved');
      }
      const user = await User.findById(userId);
      console.log('Fetched user:', user);
      if (!user.clubs.includes(clubId)) {
        user.clubs.push(clubId);
        await user.save();
        console.log('Added club to user.clubs and saved');
      }
    } else if (req.organizer) {
      // Organizer joining club
      const organizerId = req.organizer.id;
      console.log('Organizer joining - organizerId:', organizerId, 'clubId:', clubId);
      const club = await Club.findById(clubId);
      console.log('Fetched club:', club);
      if (!club) return res.status(404).json({ message: 'Club not found' });
      if (!club.members.includes(organizerId)) {
        club.members.push(organizerId);
        await club.save();
        console.log('Added organizer to club.members and saved');
      }
      const organizer = await Organizer.findById(organizerId);
      console.log('Fetched organizer:', organizer);
      if (!organizer.clubs.includes(clubId)) {
        organizer.clubs.push(clubId);
        await organizer.save();
        console.log('Added club to organizer.clubs and saved');
      }
    } else {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.json({ message: 'Joined club successfully' });
  } catch (err) {
    console.error('Error in joinClub:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /clubs/exit { clubId }
exports.exitClub = async (req, res) => {
  try {
    console.log('exitClub called');
    const { clubId } = req.body;
    
    if (req.user) {
      // User exiting club
      const userId = req.user.id;
      console.log('User exiting - userId:', userId, 'clubId:', clubId);
      const club = await Club.findById(clubId);
      console.log('Fetched club:', club);
      if (!club) return res.status(404).json({ message: 'Club not found' });
      club.members = club.members.filter(id => id && id.toString() !== userId.toString());
      await club.save();
      console.log('Removed user from club.members and saved');
      const user = await User.findById(userId);
      console.log('Fetched user:', user);
      user.clubs = user.clubs.filter(id => id && id.toString() !== clubId.toString());
      await user.save();
      console.log('Removed club from user.clubs and saved');
    } else if (req.organizer) {
      // Organizer exiting club
      const organizerId = req.organizer.id;
      console.log('Organizer exiting - organizerId:', organizerId, 'clubId:', clubId);
      const club = await Club.findById(clubId);
      console.log('Fetched club:', club);
      if (!club) return res.status(404).json({ message: 'Club not found' });
      club.members = club.members.filter(id => id && id.toString() !== organizerId.toString());
      await club.save();
      console.log('Removed organizer from club.members and saved');
      const organizer = await Organizer.findById(organizerId);
      console.log('Fetched organizer:', organizer);
      organizer.clubs = organizer.clubs.filter(id => id && id.toString() !== clubId.toString());
      await organizer.save();
      console.log('Removed club from organizer.clubs and saved');
    } else {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.json({ message: 'Exited club successfully' });
  } catch (err) {
    console.error('Error in exitClub:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /clubs/:clubId/chat
exports.getClubChat = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId).populate('chat.user', 'name avatar');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    // Only block users who are not members; organizers always allowed
    if (req.user) {
      const isMember = club.members.map(id => id.toString()).includes(req.user.id.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'You must join the club to view the chat.' });
      }
    }
    // If organizer, always allow
    
    // Sort chat by timestamp ascending
    const chat = club.chat.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /clubs/:clubId/chat/:messageId
exports.deleteClubChatMessage = async (req, res) => {
  try {
    const { clubId, messageId } = req.params;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Remove the message by its _id
    const initialLength = club.chat.length;
    club.chat = club.chat.filter(msg => msg._id.toString() !== messageId);
    if (club.chat.length === initialLength) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await club.save();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /clubs/:clubId
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json({
      name: club.name,
      icon: club.icon,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /clubs/:clubId/members
exports.getClubMembers = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId).populate('members', 'name email studentId avatar');
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // All users and organizers can view members
    res.json(club.members);
  } catch (err) {
    console.error('Error fetching club members:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 