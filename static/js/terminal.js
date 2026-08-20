function initializeTerminal() {
    const input =
        document.getElementById("commandInput");

    const output =
        document.getElementById("terminalOutput");

    const body =
        document.getElementById("terminalBody");

    const prompt =
        document.getElementById("terminalPrompt");

    if (!input || !output || !body || !prompt) {
        console.error(
            "Terminal initialization failed."
        );

        return;
    }

    let currentDirectory =
        "/home/nexus";

    const novaStagesShown =
        new Set();


    function displayPath() {
        if (currentDirectory === "/home/nexus") {
            return "~";
        }

        return currentDirectory;
    }


    function updatePrompt() {
        prompt.textContent =
            `nexus@node:${displayPath()}$`;
    }


    function escapeHTML(text) {
        const element =
            document.createElement("div");

        element.textContent =
            text;

        return element.innerHTML;
    }


    function addCommand(
        command,
        result
    ) {
        const commandLine =
            document.createElement("div");

        commandLine.className =
            "terminal-line";

        commandLine.innerHTML =
            `<span class="terminal-prompt">nexus@node:${displayPath()}$</span> ${escapeHTML(command)}`;

        output.appendChild(
            commandLine
        );

        if (result) {

            const resultLine =
                document.createElement("div");

            resultLine.className =
                "terminal-line";

            resultLine.textContent =
                result;

            output.appendChild(
                resultLine
            );
        }

        body.scrollTop =
            body.scrollHeight;
    }


    function showNovaStage(
        stage
    ) {
        if (
            typeof novaProgress !==
            "function"
        ) {
            return;
        }

        if (
            novaStagesShown.has(stage)
        ) {
            return;
        }

        novaStagesShown.add(
            stage
        );

        novaProgress(
            stage
        );
    }


    function handleNovaProgress(
        command
    ) {

        const normalized =
            command
            .trim()
            .replace(
                /\s+/g,
                " "
            );


        if (
            normalized === "ls" &&
            currentDirectory === "/home/nexus"
        ) {

            showNovaStage(
                "home"
            );

            return;
        }


        if (
            normalized === "ls /"
        ) {

            showNovaStage(
                "root"
            );

            return;
        }


        if (
            normalized === "ls /logs"
        ) {

            showNovaStage(
                "logs"
            );

            return;
        }


        if (
            normalized ===
            "cat /logs/access.log"
        ) {
            showNovaStage(
                "suspicious_ip"
            );

            return;
        }


        if (
            normalized === "ls /etc"
        ) {

            showNovaStage(
                "etc"
            );

            return;
        }


        if (
            normalized ===
            "cat /etc/network.conf"
        ) {

            showNovaStage(
                "network_config"
            );

            return;
        }
    }


    async function runCommand(
        command
    ) {

        try {

            const response =
                await fetch(
                    "/api/terminal", {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            command: command,

                            cwd: currentDirectory
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Terminal backend error."
                );
            }


            const data =
                await response.json();


            if (
                data.output ===
                "__CLEAR__"
            ) {

                output.innerHTML =
                    "";

            } else {

                addCommand(
                    command,
                    data.output
                );
            }


            currentDirectory =
                data.cwd;

            updatePrompt();


            if (
                data.new_message
            ) {

                showNewMessageNotification(
                    data.message_stage
                );


                const messagesWindow =
                    document.getElementById(
                        "messagesWindow"
                    );


                if (messagesWindow) {

                    await updateMessages();
                }
            }


            handleNovaProgress(
                command
            );


            input.focus();

        } catch (error) {

            console.error(
                error
            );

            addCommand(
                command,
                "NEXUS: connection to system failed."
            );

            input.focus();
        }
    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }

            event.preventDefault();


            const command =
                input.value.trim();


            if (!command) {
                return;
            }


            input.value =
                "";


            runCommand(
                command
            );
        }
    );


    body.addEventListener(
        "click",
        function () {

            input.focus();
        }
    );


    updatePrompt();

    input.focus();


    setTimeout(
        function () {

            showNovaStage(
                "terminal"
            );

        },
        500
    );
}


window.initializeTerminal =
    initializeTerminal;