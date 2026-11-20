import { applyDecorators, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthenticated(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'A valid access token is required.',
    }),
  );
}

export function ApiControllerDocs(tag: string): ClassDecorator {
  return (controller) => {
    ApiTags(tag)(controller);

    const prototype = controller.prototype as object;
    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (methodName === 'constructor') continue;

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      if (!descriptor || typeof descriptor.value !== 'function') continue;
      const handler = descriptor.value;

      const routePath = Reflect.getMetadata(PATH_METADATA, handler);
      const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler) as
        RequestMethod | undefined;
      if (routePath === undefined || requestMethod === undefined) continue;

      const resource = tag.toLowerCase();
      const defaultSummaries: Record<string, string> = {
        create: `Create ${resource}`,
        findAll: `List ${resource}`,
        findOne: `Get ${resource} by ID`,
        update: `Update ${resource}`,
        remove: `Delete ${resource}`,
      };
      const summary =
        defaultSummaries[methodName] ??
        methodName
          .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
          .replace(/^./, (character) => character.toUpperCase());
      ApiOperation({ summary })(prototype, methodName, descriptor);

      const successStatus =
        requestMethod === RequestMethod.POST ? '201' : '200';
      const documentedResponses =
        Reflect.getMetadata('swagger/apiResponse', handler) ?? {};
      if (!documentedResponses[successStatus]) {
        if (requestMethod === RequestMethod.POST) {
          ApiCreatedResponse({
            description: 'Resource created successfully.',
          })(prototype, methodName, descriptor);
        } else {
          ApiOkResponse({
            description: 'Request completed successfully.',
          })(prototype, methodName, descriptor);
        }
      }

      ApiBadRequestResponse({ description: 'The request is invalid.' })(
        prototype,
        methodName,
        descriptor,
      );
      if (String(routePath).includes(':id')) {
        ApiNotFoundResponse({
          description: 'The requested resource was not found.',
        })(prototype, methodName, descriptor);
      }
    }
  };
}
