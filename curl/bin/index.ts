import { program, Command } from "commander";
import { get, request, RequestOptions } from "http";

function run(args?: string[]) {
    program
    .name("ccurl")
    .description("A simple implementation of curl to make HTTP requests")
    .argument("<url>")
    .option("-v, -verbose", "Enable verbose mode to print out all the information", false)
    .option("-X, --method <method>", "HTTP method (GET by default)", "GET")
    .action((url, options) => {
        if(!url) {
            console.error("Error: Please provide a URL");
            process.exit(1);
        }

        const parsedUrl = new URL(url);
        const requestOptions: RequestOptions = {
            host: parsedUrl.host,
            protocol: parsedUrl.protocol,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            headers: {
                connection: "close"
            }
        };

        if(!options.method) {
            // Sending a GET request by default
            const req = get(requestOptions, (res) => {
                console.log(`Sending request ${requestOptions.method} ${requestOptions.path} ${requestOptions.protocol}/${res.httpVersion}`);
                console.log(`Host: ${requestOptions.host}\n Accept: *${requestOptions.headers?.accept}*\n Connection: ${requestOptions.headers?.connection}`);

                const { statusCode } = res;

                if(statusCode !== 200) {
                    const error = new Error(`Request Failed with response status code ${statusCode}`);
                    console.error(error.message);
                    res.resume();
                    return;
                }
                
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    console.log(chunk);
                });
                
                res.on("end", () => {
                    console.log(res.headers);
                });

                // res.on('end', () => {
                //     try {
                //         const parsedData = JSON.parse(rawData);
                //         console.log(parsedData);
                //     } catch (e) {
                //         console.error(e.message);
                //     }
                // });
            });

            req.on("error", (e: Error) => {
                console.log(`Error: ${e.message}`);
            });

            req.end();
        }
    })
    .parse(args);
};

export { run };