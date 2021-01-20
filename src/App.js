import React from "react";
import ReactDOMServer from "react-dom/server";
import Matter from "matter-js";
import styled from "styled-components";
import $ from "jquery";
import G from "./svg/G";
import I from "./svg/I";
import F from "./svg/F";
import T from "./svg/T";
import P from "./svg/P";
import E from "./svg/E";
import R from "./svg/R";
import S from "./svg/S";
import frontLetter from "./png/frontLetter.png";
import backLetter from "./png/backLetter.png";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const CenterContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  span {
    display: block;
    white-space: nowrap;
    margin: 20 0;
    font-size: calc(24px + 2vw);
  }
`;

const LetterContainer = styled.div`
  position: absolute;
  img {
    position: absolute;
  }
`;

const {
  Common,
  Engine,
  Render,
  World,
  Body,
  Bodies,
  Mouse,
  MouseConstraint,
  Svg,
  Composites,
} = Matter;

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

// const randomLightColor = () => {
//   var letters = "BCDEF".split("");
//   var color = "#";
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * letters.length)];
//   }
//   return color;
// };

const animateCSS = (
  element,
  animation,
  duration = "2s",
  prefix = "animate__"
) => {
  // We create a Promise and return it
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);
    node.style.setProperty("--animate-duration", duration);

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const randomNumber = (min = 0, max = 10) =>
  Math.floor(Math.random() * max) + min;

function makePattern(pWidth) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = canvas.height = pWidth || (10 + Math.random() * 20) >> 0;
  ctx.fillStyle = randomColor();
  if (Math.random() * 2 < 1) {
    ctx.arc(
      (canvas.width / 2) >> 0,
      (canvas.width / 2) >> 0,
      canvas.width * (Math.random() * 0.5),
      0,
      2 * Math.PI
    );
    ctx.fill();
  } else {
    var half = canvas.width / 2;
    var lineHeight = (Math.random() * canvas.width) >> 0;
    ctx.translate(half, half);
    ctx.rotate((Math.random() * 90 * Math.PI) / 180);
    ctx.fillRect(
      -canvas.width,
      (-lineHeight / 2) >> 0,
      canvas.width * 2,
      lineHeight
    );
  }
  return ctx.createPattern(canvas, "repeat");
}

const defaultName = "gift";

class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: defaultName,
      submited: false,
    };
  }

  componentDidMount() {
    animateCSS("#intro", "zoomInDown");
    const _this = this;
    const engine = Engine.create();
    const { world } = engine;
    const width = window.innerWidth; // (window.innerWidth * 80) / 100;
    const height = window.innerHeight; // (window.innerHeight * 80) / 100;
    const wallthick = 10;
    const ratio = width < 720 ? 2 : width < 1080 ? 1.5 : 1.25;

    const render = Render.create({
      element: this.refs.scene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "#F8A7BA",
      },
    });
    const categoryName = {
      1: "wall",
      2: "alphabet",
      3: "collector",
      4: "decoration",
    };
    const wallCategory = 0x0001,
      alphabetCategory = 0x0002,
      collectorCategory = 0x0003,
      dbCategory = 0x0004;

    // add wall
    const wallOptions = {
      label: "wall",
      collisionFilter: {
        category: wallCategory,
      },
      isStatic: true,
      render: {
        visible: false,
      },
    };
    const walls = [
      Bodies.rectangle(0, height / 2, wallthick, height, wallOptions), //left
      Bodies.rectangle(width, height / 2, wallthick, height, wallOptions), //right
      Bodies.rectangle(width / 2, 0, width, wallthick, wallOptions), // top
      Bodies.rectangle(width / 2, height, width, wallthick, wallOptions), // bottom
    ];

    World.add(world, walls);
    // end add wall

    // add bodies from SVG
    // const alphabets = [T];
    // const fillStyle = makePattern();
    // const strokeStyle = randomColor();
    // alphabets.forEach((alphabet) => {
    //   const data = ReactDOMServer.renderToStaticMarkup(alphabet());
    //   const vertexSets = [];

    //   $(data)
    //     .find("path")
    //     .each(function (i, path) {
    //       vertexSets.push(Svg.pathToVertices(path, 100));
    //     });

    //   const body = Bodies.fromVertices(
    //     randomNumber(100, width - 100),
    //     randomNumber(50, height / 2),
    //     vertexSets,
    //     {
    //       render: {
    //         fillStyle,
    //         strokeStyle,
    //         lineWidth: 1,
    //         sprite: {
    //           texture: "png/008-g.png",
    //         },
    //       },
    //     },
    //     true
    //   );

    //   Body.scale(body, 0.2, 0.2);

    //   World.add(world, body);
    // });
    // end add bodies from SVG

    // add mouse control
    const mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });

    World.add(world, mouseConstraint);
    console.log("mouseConstraint", mouseConstraint);

    Matter.Events.on(mouseConstraint, "mousedown", function (e) {
      // console.log("mousedown", e);
      // World.add(world, Bodies.circle(150, 50, 30, { restitution: 0.7 }));
    });

    Matter.Events.on(mouseConstraint, "startdrag", function (e) {
      // const { body } = e;
      // Body.setAngle(body, 0);
    });

    Matter.Events.on(mouseConstraint, "enddrag", function (e) {
      // const { body } = e;
      // Body.setAngle(body, 0);
    });
    // end add mouse control

    let x = width / 22; //randomNumber(100, width - 100);
    const y = height / 2; //randomNumber(50, height / 2);
    // const alphabetsImage = ["g", "i", "f", "t", "s", "p", "r", "i", "t", "e"];
    const alphabetsImage = [
      "g",
      "i",
      "f",
      "t",
      "s",
      "p",
      "r",
      "i",
      "t",
      "e",
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
    ];
    const bodiesToPush = shuffle(alphabetsImage).map((alphabet) => {
      const isNumber = typeof alphabet === "number";
      const size = 128;
      const body = Bodies.circle(x, y, size / 2 / ratio, {
        label: alphabet,
        collisionFilter: {
          category: isNumber ? dbCategory : alphabetCategory,
        },
        restitution: 0.9,
        render: {
          sprite: {
            texture: `png/${alphabet}.png`,
            xScale: 1 / ratio,
            yScale: 1 / ratio,
          },
        },
      });
      x += width / 22;

      // Body.applyForce(
      //   body,
      //   { x: body.position.x, y: body.position.y },
      //   { x: Math.random(), y: Math.random() }
      // );

      return body;
    });

    // var stack = Composites.stack(x, y, 10, 8, 10, 10, function (x, y) {
    //   return Bodies.circle(x, y, Common.random(15, 30), {
    //     restitution: 0.6,
    //     friction: 0.1,
    //   });
    // });

    World.add(world, bodiesToPush);

    const collectorBodies = [];
    const widthStart = width / 8;
    const fillStyle = makePattern();
    const strokeStyle = randomColor();
    for (let index = 1; index <= 4; index++) {
      const size = widthStart;
      const thick = 20;
      const xPos = widthStart * index * 2 - widthStart;
      const yPos = height / 3 / ratio;
      const collectorBodyOptions = {
        collisionFilter: {
          category: collectorCategory,
          group: index,
        },
        isStatic: true,
        render: {
          fillStyle: "#FDB876",
          lineWidth: 5,
          strokeStyle: "#000",
        },
        chamfer: { radius: 10 },
      };

      const base = Bodies.rectangle(xPos, yPos, size, thick, {
        ...collectorBodyOptions,
      });
      const left = Bodies.rectangle(
        xPos - size / 2.25,
        yPos - size / 5,
        thick,
        size / 2,
        { ...collectorBodyOptions }
      );
      const right = Bodies.rectangle(
        xPos + size / 2.25,
        yPos - size / 5,
        thick,
        size / 2,
        {
          ...collectorBodyOptions,
          render: {
            ...collectorBodyOptions.render,
            fillStyle: "#E4A669",
          },
        }
      );

      const compoundBody = Body.create({
        parts: [left, right, base],
        isStatic: true,
        collisionFilter: {
          category: collectorCategory,
          group: index,
        },
      });

      collectorBodies.push(compoundBody);
    }

    World.add(world, [...collectorBodies]);

    Matter.Events.on(engine, "collisionEnd", function (event) {});

    Matter.Events.on(engine, "collisionActive", function (event) {
      const { pairs } = event;
      let name = defaultName;

      pairs.forEach((pair) => {
        const { bodyA } = pair;
        const { category: cateA } = pair.bodyA.collisionFilter;
        const {
          category: cateB,
          group: alphabetIndex,
        } = pair.bodyB.collisionFilter;
        const cateBodyA = categoryName[cateA];
        const cateBodyB = categoryName[cateB];

        if (cateBodyB === categoryName[3] && cateBodyA === categoryName[2]) {
          Body.setAngle(bodyA, 0);
          const { label: alphabetCollised } = bodyA;
          var chars = name.split("");
          chars[alphabetIndex - 1] = alphabetCollised;

          name = chars.join("");
        }
      });

      _this.setState({
        name,
      });
    });

    Engine.run(engine);

    Render.run(render);

    _this.setState({
      world,
      collectorBodies,
      walls,
    });
  }

  onSubmit = () => {
    console.log("this.state", this.state.name);
    this.state.collectorBodies.forEach((collector) => {
      Body.setStatic(collector, false);
    });
    World.remove(this.state.world, this.state.walls);
    Promise.all([
      animateCSS("#intro", "zoomOut"),
      animateCSS("#showname", "zoomOut"),
      animateCSS("#submitBtn", "zoomOut"),
    ]).then(() => {
      World.remove(this.state.world, this.state.collectorBodies);
      this.setState({
        submited: true,
      });
    });
  };

  onTestLetter = () => {
    animateCSS("#frontLetter", "zoomOut");
  };

  render() {
    const { name, submited } = this.state;
    const trimedName = name.replaceAll(" ", "");

    return (
      <>
        <Container ref="scene">
          <LetterContainer>
            <img id="backLetter" src={backLetter} alt="Logo" />
            <img id="frontLetter" src={frontLetter} alt="Logo" />
          </LetterContainer>
          <CenterContainer>
            {!submited && (
              <>
                <span id="intro">Please spell your nickname.</span>
                <span id="showname">
                  {trimedName.length
                    ? `Your nickname is "${capitalizeFirstLetter(trimedName)}"`
                    : ""}
                </span>
                <button id="submitBtn" onClick={this.onTestLetter}>
                  Submit
                </button>
              </>
            )}
          </CenterContainer>
        </Container>
      </>
    );
  }
}
export default Scene;

// soft body

// const particleOptions = {
//   friction: 0.05,
//   frictionStatic: 0.1,
//   render: {
//     sprite: {
//       texture: "png/008-g.png",
//     },
//   },
// };

// const constraintOptions = {
//   render: { visible: false },
// };

// Composites.softBody(
//   100,
//   100,
//   1,
//   1,
//   0,
//   0,
//   false,
//   18,
//   particleOptions,
//   constraintOptions
// ),
// Composites.softBody(400, 300, 8, 3, 0, 0, false, 15, particleOptions),
// Composites.softBody(250, 400, 4, 4, 0, 0, false, 15, particleOptions),
// walls
