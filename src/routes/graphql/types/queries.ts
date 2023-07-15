import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import '../../../plugins/db.js';
import { UserType } from './types.js';
import { FastifyInstance } from 'fastify/types/instance.js';

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users,
  }),
});

export const users = {
  type: new GraphQLList(UserType),
  resolve: async (_source: any, _args: any, { prisma }: FastifyInstance) => {
    return await prisma.user.findMany();
  },
};
