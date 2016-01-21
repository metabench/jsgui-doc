
## Custom mocha reporter for jsgui doc builder

This reporter is based on **`html_table_reporter`** project:

[https://www.npmjs.com/package/good-mocha-html-reporter](https://www.npmjs.com/package/good-mocha-html-reporter)

[https://github.com/Gauge/html_table_reporter](https://github.com/Gauge/html_table_reporter)

It is not prepared as npm package. Please copy it to the global npm directory yourself. The code is so far from good, sorry.

### Install

Copy the `main.js`, `page-test-template.html`, and `assets` directory content to the global npm `node_modules` directory, `my-mocha-reporter` subdirectory. 

For example, on Windows 7 the result should looks as follows:

`C:\Users\(user)\AppData\Roaming\npm\node_modules\my-mocha-reporter\` directory content:


    node_modules (7 dirs inside)
    .npmignore
    main.js
    package.json
    page-test-template.html
    Readme.md
    
