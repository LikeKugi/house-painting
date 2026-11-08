// Contract test: mirrors the 47 assertions of the freeCodeCamp
// "Build a House Painting" CSS lab against the built artifacts.
//
// Run it with:  npm test   (or)   node contract-test.mjs
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, "index.html"), "utf8");
const css = readFileSync(join(dir, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/* ------------------------------------------------------------------ parsing */

const rules = [];
const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = ruleRe.exec(css))) {
    rules.push([m[1].trim().replace(/\s+/g, " "), m[2]]);
}

const pairsOf = (selector) => {
    const found = [];
    for (const [selectorList, body] of rules) {
        if (!selectorList.split(",").map((s) => s.trim()).includes(selector)) continue;
        for (const decl of body.split(";")) {
            const i = decl.indexOf(":");
            if (i > -1) found.push([decl.slice(0, i).trim(), decl.slice(i + 1).trim()]);
        }
    }
    return found;
};

const get = (selector, prop) => {
    const hit = pairsOf(selector).find(([p]) => p === prop);
    return hit ? hit[1] : undefined;
};
const px = (value) => (value === undefined ? NaN : parseFloat(value));
const isSet = (selector, prop) => {
    const v = get(selector, prop);
    return v !== undefined && v !== "" && v !== "none" && v !== "auto" && v !== "0px";
};

/* ------------------------------------------------- house + children in HTML */

const houseOpen = html.indexOf('<div id="house"');
const houseChildrenIds = [...html.slice(houseOpen, html.indexOf("</figure>")).matchAll(/<div id="([^"]+)"/g)]
    .map((x) => x[1])
    .filter((id) => id !== "house");
const inHouse = (id) => houseChildrenIds.includes(id);

/* ------------------------------------------------------------- geometry box */

const BORDER = px(get("#house", "border"));
const HOUSE_W = px(get("#house", "width"));
const HOUSE_H = px(get("#house", "height"));
const INNER_W = HOUSE_W - 2 * BORDER; // absolutely positioned children are
const INNER_H = HOUSE_H - 2 * BORDER; // laid out against the padding box

const box = (id) => {
    const top = get(id, "top");
    const bottom = get(id, "bottom");
    const left = get(id, "left");
    const right = get(id, "right");
    const w = px(get(id, "width"));
    const h = px(get(id, "height"));
    const t = top !== undefined ? px(top) : INNER_H - px(bottom) - h;
    const l = left !== undefined ? px(left) : INNER_W - px(right) - w;
    return { top: t, bottom: t + h, left: l, right: l + w, width: w, height: h };
};

const roof = box("#roof");
const chimney = box("#chimney");
const window1 = box("#window-1");
const window2 = box("#window-2");
const door = box("#door");
const doorThird = door.height / 3;

const withinHouse = (b) => b.left >= 0 && b.right <= INNER_W && b.top >= -20 && b.bottom <= INNER_H + 1;

/* ------------------------------------------------------------------- checks */
const ids = ["chimney", "roof", "window-1", "window-2", "door"];

const checks = [
    ["1. div#house exists", /<div id="house"[\s>]/.test(html)],
    ["2. #house position relative", get("#house", "position") === "relative"],
    ["3. #house border set", isSet("#house", "border")],
    ["4. #house background-color set", isSet("#house", "background-color")],
    ["5. #house has no min-height", get("#house", "min-height") === undefined],
    ["6. #house has no min-width", get("#house", "min-width") === undefined],
    ["7. #house has no max-height", get("#house", "max-height") === undefined],
    ["8. #house has no max-width", get("#house", "max-width") === undefined],
    ["9. #house width 500px", px(get("#house", "width")) === 500],
    ["10. #house height 400px", px(get("#house", "height")) === 400],

    ["11. div#chimney inside #house", inHouse("chimney")],
    ["12. #chimney position absolute", get("#chimney", "position") === "absolute"],
    ["13. #chimney width set", px(get("#chimney", "width")) > 0],
    ["14. #chimney height set", px(get("#chimney", "height")) > 0],
    ["15. #chimney border set", isSet("#chimney", "border")],
    ["16. #chimney background-color set", isSet("#chimney", "background-color")],

    ["17. div#roof inside #house", inHouse("roof")],
    ["18. #roof position absolute", get("#roof", "position") === "absolute"],
    ["19. #roof width set", px(get("#roof", "width")) > 0],
    ["20. #roof height set", px(get("#roof", "height")) > 0],
    ["21. #roof border set", isSet("#roof", "border")],
    ["22. #roof background-color set", isSet("#roof", "background-color")],

    ["23. div#window-1 inside #house", inHouse("window-1")],
    ["24. #window-1 position absolute", get("#window-1", "position") === "absolute"],
    ["25. #window-1 width set", px(get("#window-1", "width")) > 0],
    ["26. #window-1 height set", px(get("#window-1", "height")) > 0],
    ["27. #window-1 border set", isSet("#window-1", "border")],
    ["28. #window-1 background-color set", isSet("#window-1", "background-color")],

    ["29. div#window-2 inside #house", inHouse("window-2")],
    ["30. #window-2 position absolute", get("#window-2", "position") === "absolute"],
    ["31. #window-2 width set", px(get("#window-2", "width")) > 0],
    ["32. #window-2 height set", px(get("#window-2", "height")) > 0],
    ["33. #window-2 border set", isSet("#window-2", "border")],
    ["34. #window-2 background-color set", isSet("#window-2", "background-color")],

    ["35. div#door inside #house", inHouse("door")],
    ["36. #door position absolute", get("#door", "position") === "absolute"],
    ["37. #door width set", px(get("#door", "width")) > 0],
    ["38. #door height set", px(get("#door", "height")) > 0],
    ["39. #door border set", isSet("#door", "border")],
    ["40. #door background-color set", isSet("#door", "background-color")],

    ["41. #roof top is 0", px(get("#roof", "top")) === 0],
    [
        "42. #door sits at the bottom of the house",
        px(get("#door", "bottom")) === 0 && Math.abs(door.bottom - INNER_H) < 0.5,
    ],
    [
        "43. #door has left/right and stays inside the house",
        (get("#door", "left") !== undefined || get("#door", "right") !== undefined) && withinHouse(door),
    ],
    [
        "44. #chimney top puts it at the top of the house",
        px(get("#chimney", "top")) >= -20 && px(get("#chimney", "top")) <= 20,
    ],
    ["45. #chimney z-index puts it behind the house", px(get("#chimney", "z-index")) < 0],
    [
        "46. windows sit below the roof and above one third of the door",
        [window1, window2].every(
            (w) =>
                w.top >= roof.bottom && // below the roof
                w.bottom <= door.top && // above the door head
                w.bottom <= INNER_H - doorThird // higher than a third of the door
        ),
    ],
    [
        "47. windows have left/right and stay inside the house",
        [["#window-1", window1], ["#window-2", window2]].every(
            ([id, w]) => (get(id, "left") !== undefined || get(id, "right") !== undefined) && withinHouse(w)
        ),
    ],

    ["+ every #house child is positioned absolutely", ids.every((id) => get(`#${id}`, "position") === "absolute")],
    ["+ the stylesheet is linked from the HTML", /<link[^>]+href="styles\.css"/.test(html)],
];

/* -------------------------------------------------------------------- report */

let failed = 0;
for (const [label, ok] of checks) {
    if (!ok) failed++;
    console.log(`${ok ? " ok " : "FAIL"}  ${label}`);
}
console.log(
    `\n${checks.length - failed}/${checks.length} assertions passed` +
    ` (house ${HOUSE_W}x${HOUSE_H}, inner ${INNER_W}x${INNER_H}, chimney ${chimney.width}x${chimney.height})`
);
if (failed) process.exit(1);

