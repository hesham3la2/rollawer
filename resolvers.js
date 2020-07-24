
const { PubSub, withFilter } = require('apollo-server');

const pubsub = new PubSub();

const ROLL_INCREMENTED = 'ROLL_INCREMENTED';

module.exports = {
  Query: {
    events: async (_, __, { dataSources }) => {
      const events = await dataSources.prisma.events.findMany();
      events.reverse();   
      return events;
    },
    getHallsBySerials: async (_, { serials }, { dataSources }) => {
      const halls = await dataSources.prisma.hall.findMany({
        where: {
          serial: {
            in: serials,
          },
        },
      });
      return halls ;
    },
    getHallBySerial: async (_, { serial }, { dataSources }) => {
      const hall = await dataSources.prisma.hall.findOne({
        where: {
          serial,
        },
      });
      return hall ;
    },

  },
  Mutation: {
    createEvent: async (_, { text }, { dataSources }) => {
      const newEvent = await dataSources.prisma.events.create({
        data: { text }
      });
      return newEvent ;
    },
    createHall: async (_, { data }, { dataSources }) => {
      const newHall = await dataSources.prisma.hall.create({
        data
      });
      return newHall ;
    },
    deleteEvent: async (_, { id }, { dataSources }) => {
      const deletedEvent = await dataSources.prisma.events.delete({
        where: { id },
      });
      return deletedEvent ;
    },
    addRoll: async (_, { serial }, { dataSources }) => {
      const hall = await dataSources.prisma.hall.findOne({
        where: { serial },
      });
      const rollIncremented = await dataSources.prisma.hall.update({
        where: { serial },
        data: { session: hall.session + 1 },
      });
      
      pubsub.publish(ROLL_INCREMENTED,  {rollIncremented});
      return rollIncremented ;
    },
    subRoll: async (_, { serial }, { dataSources }) => {
      const hall = await dataSources.prisma.hall.findOne({
        where: { serial },
      });
      const decremented = await dataSources.prisma.hall.update({
        where: { serial },
        data: { session: hall.session - 1 },
      });
      return decremented ;
    },
    resetRoll: async (_, { serial }, { dataSources }) => {
      const reset = await dataSources.prisma.hall.update({
        where: { serial },
        data: { session: 0 },
      });
      return reset ;
    },
  },
  Subscription: {
    rollIncremented: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([ROLL_INCREMENTED]),
        (payload, variables) => {
         return payload.serial === variables.serial;
        },
      ),
    },
  },
};