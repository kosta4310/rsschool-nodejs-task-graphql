/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import {
  PostEntity,
  PostType,
  ProfileEntity,
  ProfileType,
  UserEntity,
  CreateUserInputType,
  UserType,
  CreateProfileInputType,
  CreatePostInputType,
  ChangePostInputType,
  ChangeProfileInputType,
  ChangeUserInputType,
} from './types.js';
import { FastifyInstance } from 'fastify';
import { UUIDType } from './uuid.js';

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser,
    createPost,
    createProfile,
    deletePost,
    deleteUser,
    deleteProfile,
    changePost,
    changeProfile,
    changeUser,
    subscribeTo,
    unsubscribeFrom,
  }),
});

const createUser = {
  type: UserType,
  args: {
    dto: { type: new GraphQLNonNull(CreateUserInputType) },
  },
  resolve: async (
    _source: unknown,
    { dto }: { dto: Omit<UserEntity, 'id'> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.user.create({ data: dto });
  },
};

const createPost = {
  type: PostType,
  args: {
    dto: { type: new GraphQLNonNull(CreatePostInputType) },
  },
  resolve: async (
    _source: unknown,
    { dto }: { dto: Omit<PostEntity, 'id'> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.post.create({ data: dto });
  },
};

const createProfile = {
  type: ProfileType,
  args: {
    dto: { type: new GraphQLNonNull(CreateProfileInputType) },
  },
  resolve: async (
    _source: unknown,
    { dto }: { dto: Omit<ProfileEntity, 'id'> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.profile.create({ data: dto });
  },
};

const deletePost = {
  type: GraphQLBoolean,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { prisma }: FastifyInstance,
  ) => {
    const res = await prisma.post.delete({ where: { id } });
    return res ? true : false;
  },
};

const deleteUser = {
  type: GraphQLBoolean,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { prisma }: FastifyInstance,
  ) => {
    const res = await prisma.user.delete({ where: { id } });
    return res ? true : false;
  },
};

const deleteProfile = {
  type: GraphQLBoolean,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { prisma }: FastifyInstance,
  ) => {
    const res = await prisma.profile.delete({ where: { id } });
    return res ? true : false;
  },
};

const changePost = {
  type: PostType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: { type: new GraphQLNonNull(ChangePostInputType) },
  },
  resolve: async (
    _source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<PostEntity, 'id' & 'authorId'>> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.post.update({
      where: { id },
      data: dto,
    });
  },
};

const changeProfile = {
  type: ProfileType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
  },
  resolve: async (
    _source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<ProfileEntity, 'id' & 'userId'>> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.profile.update({
      where: { id },
      data: dto,
    });
  },
};

const changeUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeUserInputType) },
  },
  resolve: async (
    _source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<UserEntity, 'id'>> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.user.update({
      where: { id },
      data: dto,
    });
  },
};

const subscribeTo = {
  type: UserType,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    _source: unknown,
    { userId, authorId }: { userId: string; authorId: string },
    { prisma }: FastifyInstance,
  ) => {
    await prisma.subscribersOnAuthors.create({
      data: { subscriberId: userId, authorId },
    });
    return { id: userId };
  },
};

const unsubscribeFrom = {
  type: GraphQLBoolean,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    _source: unknown,
    { userId, authorId }: { userId: string; authorId: string },
    { prisma }: FastifyInstance,
  ) => {
    const res = await prisma.subscribersOnAuthors.delete({
      where: { subscriberId_authorId: { subscriberId: userId, authorId } },
    });
    return res ? true : false;
  },
};
