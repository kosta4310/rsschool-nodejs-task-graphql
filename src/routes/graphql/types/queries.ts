import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { FastifyInstance } from 'fastify';

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users,
  }),
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: GraphQLString },
    id: { type: new GraphQLNonNull(GraphQLID) },
    balance: { type: GraphQLFloat },
  }),
});

export const users = {
  type: new GraphQLList(UserType),
  resolve: async (_source: any, _args: any, { prisma }: FastifyInstance) => {
    return await prisma.user.findMany();
  },
};

export const memberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discont: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});
