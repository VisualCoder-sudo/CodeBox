let myData = JSON.parse(localStorage.getItem("SText")) || [];

    window.onload = () => { updateFilterDropdown(); renderList(); };

    function saveData() {
        const nameVal = document.getElementById('nameInput').value;
        const textVal = document.getElementById('userInput').value;
        if (!nameVal || !textVal) return alert("Fill Name and Code!");

        myData.push({
            name: nameVal,
            text: textVal,
            category: document.getElementById('categoryInput').value || "General",
            color: document.getElementById('colorInput').value,
            id: Date.now(),
            date: new Date().toLocaleString()
        });
        sync();
    }

    function exportToJSON() {
        if (myData.length === 0) return alert("Nothing to export!");
        const dataStr = JSON.stringify(myData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = "Codebox Code Backup.json";
        link.click();
    }

    function importFromJSON(input) {
    const file = input.files[0];
    if (!file) return;

    const proceed = confirm("Warning: Restoring from a backup will replace all your current text, Do you want to continue?");

    if (proceed) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                if (Array.isArray(imported)) {
                    myData = imported; 
                    sync();
                    alert("All data fully restored");
                } else {
                    alert("invalid file");
                }
            } catch (err) {
                alert("File is not JSON, try another file");
            }
        };
        reader.readAsText(file);
    } else {
        input.value = "";
        alert("Restore cancelled. Your data has not been modified");
    }
}

    function clearVault() {
        if(confirm("Delete Everything? you cannot undo this")) {
            myData = []; sync();
        }
    }

    function sync() {
        localStorage.setItem("SText", JSON.stringify(myData));
        updateFilterDropdown();
        renderList();
        document.getElementById('nameInput').value = "";
        document.getElementById('userInput').value = "";
    }

    function updateFilterDropdown() {
        const filter = document.getElementById('categoryFilter');
        const cats = [...new Set(myData.map(item => item.category))];
        filter.innerHTML = '<option value="All">All Categories</option>';
        cats.forEach(c => filter.innerHTML += `<option value="${c}">${c}</option>`);
    }

    function renderList() {
    const list = document.getElementById('storageList');
    const search = document.getElementById('searchBar').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;
    list.innerHTML = "";

    myData.filter(item => {
        const mSearch = item.name.toLowerCase().includes(search) || item.text.toLowerCase().includes(search);
        const mCat = (cat === "All" || item.category === cat);
        return mSearch && mCat;
    }).reverse().forEach(item => {
        const li = document.createElement('li');
        li.className = "storage-item";
        li.style.borderLeftColor = item.color;
        
        li.innerHTML = `
            <div class="item-header">
                <strong>${item.name} <span style="color:${item.color}">[${item.category}]</span></strong>
                <div class="item-actions">
                    <button class="btn-copy" onclick="copySnippet(${item.id})">Copy</button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </div>
            <div id="c-${item.id}" class="code-display"></div>
        `;
           list.appendChild(li);
           document.getElementById(`c-${item.id}`).textContent = item.text;
        });
    }

    function copySnippet(id) {
        const item = myData.find(i => i.id === id);
    
        if (item && item.text) {
            navigator.clipboard.writeText(item.text).then(() => {
                alert("Text Copied Successfully");
            }).catch(err => {
                const textArea = document.createElement("textarea");
                textArea.value = item.text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                alert("Copied (using fallback)");
            });
        } else {
            alert("Unknown Copy Error");
        }
    }

    function deleteItem(id) {
        myData = myData.filter(i => i.id !== id);
        sync();
    }