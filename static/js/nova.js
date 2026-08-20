let novaBox = null;
let novaText = null;
let novaTimeout = null;

async function initializeNova() {
    try {
        const response =
            await fetch("/nova");

        if (!response.ok) {
            throw new Error(
                "NOVA failed to load."
            );
        }

        const html =
            await response.text();

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );

        novaBox =
            document.getElementById(
                "novaMessageBox"
            );

        novaText =
            document.getElementById(
                "novaText"
            );

    } catch (error) {

        console.error(
            "NOVA failed to initialize:",
            error
        );
    }
}


function novaSay(
    message,
    duration = 7000
) {
    if (!novaBox || !novaText) {
        return;
    }

    clearTimeout(
        novaTimeout
    );

    novaText.textContent =
        message;

    novaBox.classList.add(
        "nova-show"
    );

    novaTimeout =
        setTimeout(
            function () {

                novaBox.classList.remove(
                    "nova-show"
                );

            },
            duration
        );
}


function novaProgress(stage) {

    if (stage === "terminal") {

        novaSay(
            "Ah, there you are.\n\n" +
            "This is the terminal.\n\n" +
            "You don't need to know Linux yet. " +
            "We'll figure it out together.\n\n" +
            "Start by looking around.\n\n" +
            "Try typing: ls"
        );

        return;
    }


    if (stage === "home") {

        novaSay(
            "Nothing too interesting here.\n\n" +
            "Those look like personal files.\n\n" +
            "Maybe there's somewhere else we should look.\n\n" +
            "Try: ls /"
        );

        return;
    }


    if (stage === "root") {

        novaSay(
            "There we go.\n\n" +
            "That's the rest of the machine.\n\n" +
            "See that logs folder?\n\n" +
            "Machines keep records of what happens to them.\n\n" +
            "I'd take a look there."
        );

        return;
    }


    if (stage === "logs") {

        novaSay(
            "There you go.\n\n" +
            "Two logs.\n\n" +
            "I'd start with access.log.\n\n" +
            "If someone connected to this machine, " +
            "there's a good chance it'll be in there.\n\n" +
            "Try: cat /logs/access.log"
        );

        return;
    }


    if (stage === "suspicious_ip") {

        novaSay(
            "Okay... slow down and actually look at this.\n\n" +
            "192.168.1.44 appears several times.\n\n" +
            "Three attempts failed, then one succeeded.\n\n" +
            "That's unusual.\n\n" +
            "Don't assume it's an attacker yet. " +
            "We need evidence.\n\n" +
            "Remember that address: 192.168.1.44."
        );

        return;
    }


    if (stage === "after_access_log") {

        novaSay(
            "Good catch.\n\n" +
            "Now we have an address, but we still don't know " +
            "whether it actually belongs to this machine.\n\n" +
            "Let's find out what NEXUS thinks its own address is.\n\n" +
            "I'd look under /etc."
        );

        return;
    }


    if (stage === "etc") {

        novaSay(
            "Exactly.\n\n" +
            "That's the system configuration directory.\n\n" +
            "See network.conf?\n\n" +
            "That sounds like the file we want.\n\n" +
            "Try: cat /etc/network.conf"
        );

        return;
    }


    if (stage === "network_config") {

        novaSay(
            "There it is.\n\n" +
            "NEXUS is 192.168.1.24.\n\n" +
            "But the address we found in the log was .44.\n\n" +
            "So... who was .44?"
        );

        return;
    }


    if (stage === "challenge_complete") {

        novaSay(
            "Yeah...\n\n" +
            "You figured that one out yourself.\n\n" +
            "That's exactly how you should investigate these things.\n\n" +
            "But I don't think we're done yet."
        );

        return;
    }


    if (stage === "goodbye") {

        novaSay(
            "Hey.\n\n" +
            "Before you go...\n\n" +
            "Thanks for spending some time with NEXUS.\n\n" +
            "You did pretty well, especially if this was your first time poking around a terminal.\n\n" +
            "I'll be here if you decide to come back.\n\n" +
            "Take care, explorer.",
            12000
        );

        return;
    }
}


window.initializeNova =
    initializeNova;

window.novaSay =
    novaSay;

window.novaProgress =
    novaProgress;


window.addEventListener(
    "load",
    function () {
        initializeNova();
    }
);