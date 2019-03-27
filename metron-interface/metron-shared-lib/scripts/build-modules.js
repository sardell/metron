/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const meow = require('meow');
const execa = require('execa');
const fs = require('fs-extra');
const cpy = require('cpy');
const chokidar = require('chokidar');
const del = require('del');
const buildPkgJson = require('ngm-cli/tasks/npm/build-pkg-json.task');
const src = 'src';
const dist = 'dist';
const common = 'common';
const path = require('path');

let flags = {};

async function buildAll() {
  if (flags.watch) {
    console.log(`WATCH MODE ENABLED \n`);
  }

  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  await buildPkgJson.buildPkgJson({ src, dist });
  cpy(['*.md', 'LICENSE'], dist);

  await execa.shell(`npm run link`);

  const requiredModules = ['breadcrumb','central-navigation','common'];

  await buildModules(requiredModules);

  await execa.shell(`rsync -a dist/common/. dist/ --exclude package.json`);
  await del(`${dist}/${common}`);
}

const cli = meow(`
	Options
	  --watch Rebuild on source change
`, {
  flags: {
    watch: {
      type: 'boolean'
    }
  }
});
flags = cli.flags;

if (flags.watch) {
  chokidar.watch(src, {
    ignored: /(^|[\/\\])\../
  })
    .on('change', (event) => {
      let moduleName = event.replace(new RegExp(`src\\${path.sep}(.*)\\${path.sep}(.*)`,'i'), '$1');
      buildModules([moduleName])
    });
}

buildAll();

async function buildModules(modules) {
  for (let module of modules) {
    console.log('Building', module, 'module');
    await execa.shell(`rimraf ${dist}/${module} && node scripts/ng-packagr/api ../../src/${module}/package.json`);
    console.log(`Build of ${module} module completed`);
  }
}
