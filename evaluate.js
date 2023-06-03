import fs from 'node:fs/promises'
import * as runtime from 'react/jsx-runtime'
import {evaluate} from '@mdx-js/mdx'
import ReactDOMServer from 'react-dom/server'

let images = new Set()

function check_node(node){
    const nodeType = node.type && node.type.toString()
    if(nodeType == 'img'){
        images.add(node.props.src)
        console.log(`  * type: ${nodeType} src='${node.props.src}'`)
    }else if(nodeType == 'object'){
        images.add(node.props.data)
        console.log(`  * type: ${nodeType} data='${node.props.data}'`)
    }else{
        console.log(`  * type: ${nodeType}`)
    }
    //console.log(node)
}

function check_ast(ast){
    if(ast == '\n'){
        return
    }
    check_node(ast)
    if(ast.props?.children){
        const type_text = Object.prototype.toString.call(ast.props.children)
        //console.log(` => node.porps.children type : ${type_text}`)
        if(type_text == '[object Array]'){
            ast.props.children.forEach(element => {
                check_ast(element)
            });
        }
        else if(type_text == '[object Object]'){
            check_ast(ast.props.children)
        }
    }
}

async function check_mdx(filename){
    const mdx_text = await fs.readFile(`content/${filename}`,'utf-8')
    
    console.log(`- evaluating '${filename}'`)
    try{
        const {default: Content} = await evaluate(mdx_text,{
            ...runtime,
            development:false
        })
    
        console.log("- run content()")
        const reactElement = Content()
        await fs.writeFile(`out/${filename}-ast.json`,JSON.stringify(reactElement,null,2))

        console.log("- check_ast()")
        images = new Set()
        check_ast(reactElement)
        await fs.writeFile(`out/${filename}-images.json`,JSON.stringify([...images],null,2))

        console.log("- render")
        const html = ReactDOMServer.renderToString(reactElement)
        await fs.writeFile(`out/${filename}.html`,html)
        console.log(`- done with '${filename}'`)
    }
    catch(err){
        console.log(`- an exception error happened with '${filename}'`)
        console.error(err)
        await fs.writeFile(`out/${filename}.err`,String(err))
    }
}

check_mdx('bad.mdx')
check_mdx('good.mdx')
check_mdx('with_image.mdx')
