import { createTests } from './all-tests';
import { createNestJSExpressServer } from './helpers/create-nestjs-express-server';

createTests(createNestJSExpressServer);
