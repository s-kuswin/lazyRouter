#!/usr/bin/env node
import { program } from 'commander';

program.usage("<command>")

program.version('1.0.0')

program.command("create").description("create a request").action(() => {
  import("../app/index.js")
})

program.parse(process.argv)