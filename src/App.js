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

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const {
  Engine,
  Render,
  World,
  Body,
  Bodies,
  Mouse,
  MouseConstraint,
  Svg,
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

class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const engine = Engine.create();
    const { world } = engine;
    const width = window.innerWidth; // (window.innerWidth * 80) / 100;
    const height = window.innerHeight; // (window.innerHeight * 80) / 100;
    const wallthick = 10;

    const render = Render.create({
      element: this.refs.scene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
      },
    });

    // add wall
    const wallOptions = {
      isStatic: true,
      render: {
        visible: false,
      },
    };
    World.add(world, [
      Bodies.rectangle(0, height / 2, wallthick, height, wallOptions), //left
      Bodies.rectangle(width, height / 2, wallthick, height, wallOptions), //right
      Bodies.rectangle(width / 2, 0, width, wallthick, wallOptions), // top
      Bodies.rectangle(width / 2, height, width, wallthick, wallOptions), // bottom
    ]);
    // end add wall

    // add bodies from SVG
    const alphabets = [G, I, F, T, S, P, R, I, T, E];
    const fillStyle = makePattern();
    const strokeStyle = randomColor();
    alphabets.forEach((alphabet) => {
      const data = ReactDOMServer.renderToStaticMarkup(alphabet());
      const vertexSets = [];

      $(data)
        .find("path")
        .each(function (i, path) {
          vertexSets.push(Svg.pathToVertices(path, 100));
        });

      const body = Bodies.fromVertices(
        randomNumber(100, width - 100),
        randomNumber(50, height / 2),
        vertexSets,
        {
          render: {
            fillStyle,
            strokeStyle,
            lineWidth: 1,
          },
        },
        true
      );

      Body.scale(body, 0.2, 0.2);

      World.add(world, body);
    });
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

    Matter.Events.on(mouseConstraint, "mousedown", function (event) {
      console.log("event", event);
      // World.add(world, Bodies.circle(150, 50, 30, { restitution: 0.7 }));
    });
    // end add mouse control

    const ballA = Bodies.circle(210, 100, 64, {
      restitution: 0.5,
    });

    const ballB = Bodies.circle(210, 100, 64, {
      restitution: 0.5,
      render: {
        sprite: {
          texture: "png/008-g.png",
        },
      },
    });

    World.add(world, [ballA, ballB]);

    Engine.run(engine);

    Render.run(render);
  }

  render() {
    return (
      <>
        <Container ref="scene" />
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
