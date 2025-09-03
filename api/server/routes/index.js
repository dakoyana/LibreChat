const accessPermissions = require('./accessPermissions');
const actions = require('./actions');
const agents = require('./agents');
const assistants = require('./assistants');
const auth = require('./auth');
const balance = require('./balance');
const banner = require('./banner');
const categories = require('./categories');
const config = require('./config');
const convos = require('./convos');
const edit = require('./edit');
const endpoints = require('./endpoints');
const files = require('./files');
const keys = require('./keys');
const mcp = require('./mcp');
const messages = require('./messages');
const models = require('./models');
const oauth = require('./oauth');
const plugins = require('./plugins');
const presets = require('./presets');
const prompts = require('./prompts');   // <-- restored
const roles = require('./roles');
const search = require('./search');
const share = require('./share');
const staticRoute = require('./static');
const tags = require('./tags');
const tokenizer = require('./tokenizer');
const user = require('./user');
const memories = require('./memories'); // <-- restored

// NEW: public read-only namespace
const publicRoutes = require('./public');

module.exports = {
  mcp,
  edit,
  auth,
  keys,
  user,
  tags,
  roles,
  oauth,
  files,
  share,
  banner,
  agents,
  convos,
  search,
  config,
  models,
  prompts,    // now defined
  plugins,
  actions,
  presets,
  balance,
  messages,
  memories,   // now defined
  endpoints,
  tokenizer,
  assistants,
  categories,
  staticRoute,
  accessPermissions,

  // Mounted at /public in server index
  public: publicRoutes,
};
