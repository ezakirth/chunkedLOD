const infos = document.getElementById("infos");
const actions = document.getElementById("actions");

export function doAction(action) {
  if (action == "blur") {
    input.wireframe = false;
    input.depthOfField = !input.depthOfField;
  }

  if (action == "wireframe") {
    if (!input.depthOfField) input.wireframe = !input.wireframe;
  }

  if (action == "morph") input.vertexMorphing = !input.vertexMorphing;

  if (action == "autorun") input.autoRun = !input.autoRun;

  if (action == "fly") {
    input.flying = !input.flying;
    airTime = 0;
  }

  if (action == "fog") {
    input.fog = !input.fog;
    if (input.fog) terrain.setProgram(programs.terrain);
    else terrain.setProgram(programs.terrainNoFog);
  }

  let actionsText = "";
  actionsText +=
    "<br/><span onclick='doAction(\"blur\");'>[Depth of Field]</span> -> " +
    (input.depthOfField ? "on" : "off");
  actionsText +=
    "<br/><span onclick='doAction(\"morph\");'>[Vertex morphing]</span> -> " +
    (input.vertexMorphing ? "on" : "off");
  actionsText +=
    "<br/><span onclick='doAction(\"fog\");'>[Fog]</span> -> " +
    (input.fog ? "on" : "off");
  actionsText +=
    "<br/><span onclick='doAction(\"fly\");'>[Fly mode]</span> -> " +
    (input.flying ? "on" : "off");
  actionsText +=
    "<br/><span onclick='doAction(\"autorun\");'>[Autorun mode]</span> -> " +
    (input.autoRun ? "on" : "off");
  if (!input.depthOfField)
    actionsText +=
      "<br/><span onclick='doAction(\"wireframe\");'>[Wireframe mode]</span> -> " +
      (input.wireframe ? "on" : "off");

  actions.innerHTML = actionsText;
}

export function showInfos() {
  let infosText = "";
  var comp = mapSize / Math.pow(2, terrainDepth);
  comp = comp * comp * 2 + comp * 4 * 2;
  if (totalLoading != 100) {
    if (totalLoading < 15)
      infosText +=
        "<span style='color:red;text-decoration:none;'>" +
        totalLoading +
        "% loaded</span>";
    else if (totalLoading < 50)
      infosText +=
        "<span style='color:orange;text-decoration:none;'>" +
        totalLoading +
        "% loaded</span>";
    else if (totalLoading < 80)
      infosText +=
        "<span style='color:yellow;text-decoration:none;'>" +
        totalLoading +
        "% loaded</span>";
    else
      infosText +=
        "<span style='color:green;text-decoration:none;'>" +
        totalLoading +
        "% loaded</span>";
  } else infosText += "100% loaded";
  infosText +=
    "<br/>Quality (mouse wheel): " + Math.floor(40 / input.scale) / 10;
  //infosText += "<br/>Computed triangles: " + comp * cnt + " out of " + 528384*terrain.heightmaps.length + " ("+ Math.floor(((comp * cnt)/(528384*terrain.heightmaps.length)*1000))/10 +"% of total)<br/>" + "Draw calls: " + cnt;
  infosText += "<br/>FPS: " + fps;

  //infosText += "<br>current. x, y :" + input.current.x + ", " + input.current.y;

  infos.innerHTML = infosText;
}
