import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import appConfig from './utils/config.js';
import testMainCmdHandler from './test.js';
import argvUtils from './utils/argv.js';

async function parseCommand() {
  const yargsInstance = yargs(hideBin(process.argv));
  await yargsInstance
    .command(
      'test',
      'Test command',
      (yargs) => {
        yargs.options({
          'output-dir': {
            alias: ['o'],
            desc: 'Output root directory',
            default: path.resolve(appConfig.file.outputDir),
            normalize: true,
            type: 'string',
          },
          force: {
            alias: ['f'],
            desc: 'Force overwrites existing files',
            default: false,
            type: 'boolean',
          },
          thread: {
            alias: ['t'],
            desc: 'Set network thread count',
            default: appConfig.network.threadCount,
            deprecated: false,
            type: 'number',
          },
          'no-show-progress': {
            alias: ['np'],
            desc: 'Do not show download progress',
            default: false,
            type: 'boolean',
          },
          'log-level': {
            desc: 'Set log level',
            default: 'trace',
            deprecated: false,
            choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
            type: 'string',
          },
          benchmark: {
            desc: 'Do not write any files',
            default: false,
            type: 'boolean',
          },
        });
      },
      async (argv) => {
        argvUtils.setArgv(argv);
        await testMainCmdHandler();
      },
    )
    .usage('$0 <command> [argument] [option]')
    .help()
    .version()
    .demandCommand(1)
    .strict()
    .recommendCommands()
    .parse();
}

export default parseCommand;
