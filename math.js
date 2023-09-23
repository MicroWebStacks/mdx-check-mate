import fs from 'node:fs/promises'
import * as runtime from 'react/jsx-runtime'
import {evaluate} from '@mdx-js/mdx'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import ReactDOMServer from 'react-dom/server'


async function generate_html(filename){
    const mdx_text = await fs.readFile(`content/${filename}`,'utf-8')
    
    console.log(`- evaluating '${filename}'`)
    try{
        const {default: Content} = await evaluate(mdx_text,{
            ...runtime,
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
            development:false
        })
    
        console.log("- run content()")
        const reactElement = Content()
        await fs.writeFile(`out/${filename}-ast.json`,JSON.stringify(reactElement,null,2))

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
generate_html('math.mdx')
