/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UserType } from './queries.js';
import { FastifyInstance } from 'fastify';

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser,
  }),
});

export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const createUser = {
  type: UserType,
  args: {
    data: { type: new GraphQLNonNull(UserInputType) },
  },

  resolve: async (_source: any, args: any, { prisma }: FastifyInstance) => {
    return await prisma.user.create(args);
  },
};
