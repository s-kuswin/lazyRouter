#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import chalk from 'chalk';
import path from "path"
import ejs from "ejs"
import symbols from "log-symbols"
import beautify from "js-beautify"
import { formatRouter } from "./lazyLoad.js"
import ora from "ora"
import _ from "lodash";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firstPrompList = [
  {
    type: "list",
    name: "isType",
    message: "请选择路由数据获取方式",
    choices: ["输入路由文件路径", "上传路由文件"],
    default: "输入路由文件路径"
  }
]

const secondPrompList = [
  {
    type: "list",
    name: "fileType",
    message: "是否根据路径分割文件",
    choices: ["是", "否"],
    default: "是"
  },
  {
    type: "input",
    name: "outPutFolder",
    message: "输入生成文件名字",
    default: "router"
  },
];

const filePrompt = {
  type: "input",
  name: "sourceFile",
  message: "请把路由文件拖拽到这里"
};
const wayPrompt = {
  type: "input",
  name: "routerway",
  message: "输入路由文件路径",
  default: "./router.js"
};

inquirer.prompt(firstPrompList).then(firstAnswer => {
  secondPrompList.push(
    firstAnswer.isType === '输入路由文件路径' ? wayPrompt : filePrompt
  )
  inquirer.prompt(secondPrompList).then(secondAnswer =>{
    secondAnswer.isType = firstAnswer.isType;
    writing(secondAnswer)
  })
})

function writing(props) {
  // 出现加载图标
  const spinner = ora('Generating...')
  spinner.start()
  try{
    let fileType = props.fileType === '是';
    let outPutFolder = props.outPutFolder;
    let sourceFile;
    if (props.isType === "输入路由文件路径") {
      sourceFile = fs.readFileSync(props.routerway, 'utf8')
    } else {
      sourceFile = props.sourceFile
        ? fs.readFileSync(props.sourceFile.replace(/\'/g, ''), 'utf8')
        : props.sourceFile;
    }
  
    if (!sourceFile) {
      spinner.fail()
      return console.log(chalk.red("未检测到路由数据，请输入正确路由数据重试！"));
    }
  
    let routerData = formatRouter({
      sourceFile: sourceFile,
      fileType: fileType,
      outPutFolder
    });

    _.forEach(routerData, function(routerList, pageName){
      let outPutFile = pageName + ".js"
      const template = templatePath()
      const animalKotlin = ejs.render(fs.readFileSync(template, 'utf8'), routerList);
      writeIfModified(
        destinationFolder(outPutFolder),
        destinationPath(outPutFolder,outPutFile),
        beautify(animalKotlin, {
          indent_size: 2,//缩进两个空格
          max_preserve_newlines:1
        })
      );
    })

    spinner.succeed()
    console.log(chalk.green(symbols.success), chalk.green(`create ${outPutFolder} successfully!\n`))
  } catch(e) {
    console.log(chalk.red(e))
    spinner.fail()
  }
}

function templatePath() {
  return path.join(__dirname, './template.ejs')
}

function destinationPath(outPutFolder,outPutFile) {
  return path.join(process.cwd(), `/${outPutFolder}/${outPutFile}`)
}
function destinationFolder(outPutFolder) {
  return path.join(process.cwd(), `/${outPutFolder}`)
}

function writeIfModified(outPutFolder, filename, newContent) {
  try {
    const oldContent = fs.readFileSync(filename, 'utf8');
    if(oldContent == newContent) {
      console.log(chalk.yellow(`* Skipping file '${filename}' because it is up-to-date`));
      return;
    }
  }catch(err) {}
  fs.mkdir(outPutFolder,()=>{});
  fs.writeFileSync(filename, newContent)
}