# Secure Election Voting Backend

## Setup

- Add the project name to `/serverless.common.yml`
- Copy the `/environment/env.tpl.ts` to `/environment/env.ts` and fill in the values 
    (You may need to deploy the application to get some of these values)
- Add the table name to `/services/api-shared-modules/src/models/DynamoDBItem.ts`
- Preferably move objects from `/services/api-shared-modules/src/types/objects.ts` to an external NPM package 
    (Define objects in the package to keep consistent with client)

