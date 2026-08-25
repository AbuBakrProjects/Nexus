const SEARCH_ITEMS = [
    ["TERMINAL", "Investigate NEXUS from the command line", openTerminal],
    ["MESSAGES", "Read UNKNOWN's transmissions", openMessages],
    ["FILES", "Browse the local file view", openFiles],
    ["BROWSER", "Explore internal network routes", openBrowser],
    ["LOGS", "Read node records", openLogs],
    ["MISSIONS", "Challenges, profile, skills, achievements", openMissions],
    ["EVIDENCE", "Connect the clues you've discovered", openEvidence],
    ["NETWORK", "Monitor the local network", openNetwork],
    ["SECURITY", "Inspect node security state", openSecurity],
    ["GAMES", "Tic Tac Toe and NEXUS Memory", openGames]
];
function closeSearch(){ document.getElementById("globalSearch")?.classList.add("hidden"); }
function openSearch(){ const root=document.getElementById("globalSearch"); const input=document.getElementById("globalSearchInput"); if(!root||!input)return; root.classList.remove("hidden"); input.value=""; renderSearchResults(SEARCH_ITEMS); input.focus(); }
function renderSearchResults(items){ const root=document.getElementById("globalSearchResults"); if(!root)return; root.innerHTML=items.slice(0,7).map((item,index)=>`<button class="search-result" data-search-index="${index}">${item[0]}<small>${item[1]}</small></button>`).join(""); root.querySelectorAll(".search-result").forEach(button=>button.addEventListener("click",()=>{items[Number(button.dataset.searchIndex)][2]();closeSearch();})); }
document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();openSearch();}if(event.key==="Escape")closeSearch();});
document.addEventListener("input",event=>{if(event.target.id!=="globalSearchInput")return;const query=event.target.value.toLowerCase();renderSearchResults(SEARCH_ITEMS.filter(item=>item[0].toLowerCase().includes(query)||item[1].toLowerCase().includes(query)));});
document.addEventListener("click",event=>{if(event.target.id==="globalSearch")closeSearch();});
