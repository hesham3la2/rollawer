const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    events: [Event]
    getHallsBySerials(serials: [Int!]!): [Hall]
    getHallBySerial(serial: Int!):  Hall
  }

  type Event {
    id: String!
    text: String
  }

  type Hall {
    serial: Int!
    session: Int
    court: String
  }

  input HallInput {
    serial: Int!
    session: Int
    court: String
  }



  type Mutation {
    #Event mutation
    createEvent(text: String!): Event
    deleteEvent(id: Int!): Event

    #Hall Mutation
    createHall(data: HallInput!): Hall

    addRoll(serial: Int!): Hall
    subRoll(serial: Int!): Hall
    resetRoll(serial: Int!): Hall
  }

  type Subscription {
    rollIncremented(serial: Int!): Hall!
  }

`;

module.exports = typeDefs;
