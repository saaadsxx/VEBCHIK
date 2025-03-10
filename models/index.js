const User = require('./User');
const Event = require('./Event');

// Настройка связей
User.hasMany(Event, {
    foreignKey: 'createdBy',
    as: 'events'
});

Event.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});

module.exports = {
    User,
    Event
}; 