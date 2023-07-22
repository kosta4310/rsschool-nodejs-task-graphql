import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import DataLoader from 'dataloader';
import { getDataloaders } from './utilites/getDataloaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);

      const dataloaders = getDataloaders(fastify);

      const { data } = await graphql({
        schema,
        source: String(req.body.query),
        contextValue: { fastify, dataloaders },
        variableValues: req.body.variables,
      });

      if (errors.length) {
        return { errors };
      }
      return { data };
    },
  });
};

export default plugin;
