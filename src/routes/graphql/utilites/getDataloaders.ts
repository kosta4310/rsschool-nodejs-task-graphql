import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { GetResult } from '@prisma/client/runtime/library.js';
import DataLoader from 'dataloader';
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';

export function getDataloaders(
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >,
) {
  async function userBatchFunction(keys: unknown) {
    const results = await fastify.prisma.user.findMany({
      where: { id: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map(
      (key) =>
        results.find((user) => user.id === key) || new Error(`No result for ${key}`),
    );
  }

  async function postBatchFunction(userIds: unknown) {
    const results = await fastify.prisma.post.findMany({
      where: { authorId: { in: userIds as Array<string> } },
    });
    console.log('result', results);

    return (userIds as Array<string>).map((userId) =>
      results.find(({ authorId }) => authorId === userId),
    );
  }

  async function profileBatchFunction(keys: unknown) {
    const results = await fastify.prisma.profile.findMany({
      where: { id: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map(
      (key) =>
        results.find((profile) => profile.id === key) ||
        new Error(`No result for ${key}`),
    );
  }

  async function memberTypesBatchFunction(keys: unknown) {
    const results = await fastify.prisma.memberType.findMany({
      where: { id: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map(
      (key) =>
        results.find((memberType) => memberType.id === key) ||
        new Error(`No result for ${key}`),
    );
  }

  const userDataloader = new DataLoader(userBatchFunction);
  const postDataloader = new DataLoader(postBatchFunction);
  const profileDataloader = new DataLoader(profileBatchFunction);
  const memberTypesDataloader = new DataLoader(memberTypesBatchFunction);

  const dataloaders: {
    userDataloader: DataLoader<unknown, unknown, unknown>;
    postDataloader: DataLoader<unknown, unknown, unknown>;
    profileDataloader: DataLoader<unknown, unknown, unknown>;
    memberTypesDataloader: DataLoader<unknown, unknown, unknown>;
  } = {
    userDataloader: userDataloader,
    postDataloader: postDataloader,
    profileDataloader: profileDataloader,
    memberTypesDataloader: memberTypesDataloader,
  };

  dataloaders.userDataloader = userDataloader;
  dataloaders.postDataloader = postDataloader;
  dataloaders.profileDataloader = profileDataloader;
  dataloaders.memberTypesDataloader = memberTypesDataloader;

  return dataloaders;
}
