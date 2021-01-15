import React from "react";
import ReactDOMServer from "react-dom/server";
import Matter from "matter-js";
import styled from "styled-components";
import $ from "jquery";
import A from "./svg/A";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Svg } = Matter;

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

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
    const engine = Engine.create({
      // positionIterations: 20
    });
    const { world } = engine;
    const width = (window.innerWidth * 80) / 100;
    const height = (window.innerHeight * 80) / 100;
    const wallthick = 100;

    const render = Render.create({
      element: this.refs.scene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
      },
    });

    const ballA = Bodies.circle(210, 100, 30, {
      restitution: 0.5,
    });

    const ballB = Bodies.circle(110, 50, 30, {
      restitution: 0.5,
    });
    World.add(world, [
      // walls

      Bodies.rectangle(0, height / 2, wallthick, height, { isStatic: true }), //left
      Bodies.rectangle(width, height / 2, wallthick, height, {
        isStatic: true,
      }), //right
      Bodies.rectangle(width / 2, 0, width, wallthick, { isStatic: true }), // top
      Bodies.rectangle(width / 2, height, width, wallthick, { isStatic: true }), // bottom
    ]);

    World.add(world, [ballA, ballB]);
    const data = ReactDOMServer.renderToStaticMarkup(A());
    console.log("data", data);

    const vertexSets = [];

    $(data)
      .find("path")
      .each(function (i, path) {
        vertexSets.push(Svg.pathToVertices(path, 100));
      });

    World.add(
      world,
      Bodies.fromVertices(
        width / 2,
        height / 2,
        vertexSets,
        {
          render: {
            fillStyle: makePattern(),
            strokeStyle: randomColor(),
            lineWidth: 1,
          },
        },
        true
      )
    );

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
      World.add(world, Bodies.circle(150, 50, 30, { restitution: 0.7 }));
    });

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
