<?php

namespace App\Controllers;

class Home extends BaseController
{
    /**
     * Serves the React Single Page Application (SPA).
     */
    public function index()
    {
        // Redirect root '/' or empty path to '/react/' so React Router's basename matches
        $uri = service('request')->getUri()->getPath();
        if (empty($uri) || $uri === '/' || $uri === 'index.php') {
            return redirect()->to('/react/');
        }

        $path = FCPATH . 'react/index.html';
        
        if (!file_exists($path)) {
            return "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>LMS - Initialization</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #1a1b1e;
                        color: #c1c2c5;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .container {
                        max-width: 500px;
                        padding: 30px;
                        background-color: #25262b;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                        border: 1px solid #373a40;
                    }
                    h1 {
                        color: #228be6;
                        margin-top: 0;
                    }
                    code {
                        background-color: #141517;
                        color: #fab005;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: monospace;
                        display: block;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h1>Lean Management System</h1>
                    <p>The React frontend build is not found. To compile the production assets, please run the following command in your terminal:</p>
                    <code>npm run build:frontend</code>
                    <p style='font-size: 12px; color: #909296;'>This will generate the required static bundle inside public/react/.</p>
                </div>
            </body>
            </html>
            ";
        }
        
        $html = file_get_contents($path);
        
        // Rewrite relative asset paths dynamically using base_url()
        // This ensures the assets are always loaded from the correct public/react/ location,
        // even when index.php or subdirectories are present in the browser URL.
        // We use rtrim() and append '/react/' to guarantee the trailing slash is always present.
        $reactBaseUrl = rtrim(base_url(), '/') . '/react/';
        $html = str_replace('src="./assets/', 'src="' . $reactBaseUrl . 'assets/', $html);
        $html = str_replace('href="./assets/', 'href="' . $reactBaseUrl . 'assets/', $html);
        $html = str_replace('href="/react/favicon.png"', 'href="' . $reactBaseUrl . 'favicon.png"', $html);
        
        return $html;
    }
}
