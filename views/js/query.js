const defaultQuery = async () => {
    const response = await fetch('/default');
    const data = await response.json();

    displayContent(data);
}

const drillDown = async () => {
    const response = await fetch('/drilldown');
    const data = await response.json();

    displayContent(data);
}

const rollUp = async () => {
    const response = await fetch('/rollup');
    const data = await response.json();

    displayContent(data);
}

const slice = async () => {
    var input = $("#sliceLocation").val();
    console.log(input);
    
    $("#slice").modal("toggle");

    const response = await fetch('/slice?sliceLocation='+input);
    const data = await response.json();

    displayContent(data);
}

const dice = async () => {
    var location = $("#diceLocation").val();
    var type = $("#diceType").val();
    console.log(location, type);

    $("#dice").modal("toggle");

    const response = await fetch('/dice?diceLocation='+location+'&diceType='+type);
    const data = await response.json();

    displayContent(data);
}

function displayContent(data) {
    $("#content").html("");
    
    var table = "<table id='table' style='width:80vw'>";

    table += "<thead><tr>";

    for(let j = 0; j < Object.keys(data[0]).length; j++) {
        table += "<th>" + Object.keys(data[0])[j] + "</th>";
    }

    table += "</tr></thead>";

    table += "<tbody>"

    for(let i = 0; i < data.length; i++) {
        table += "<tr>";
        for(let j = 0; j < Object.keys(data[i]).length; j++) {
            table += "<td>" + data[i][Object.keys(data[i])[j]] + "</td>";
        }
        table += "</tr>";
    }

    table += "</tbody>"

    table += "</table>"

    $("#content").html(table);
    $("#table").DataTable();
}