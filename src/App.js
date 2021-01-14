import React from "react";
import Matter from "matter-js";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

class Scene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create({
      // positionIterations: 20
    });
    const width = (window.innerWidth * 80) / 100;
    const height = (window.innerHeight * 80) / 100;
    const wallthick = 100;
    console.log("window.innerHeight", window.innerHeight, window.innerWidth);

    const render = Render.create({
      element: this.refs.scene,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
      },
    });

    const ballA = Bodies.circle(210, 100, 30, { restitution: 0.5 });
    const ballB = Bodies.circle(110, 50, 30, { restitution: 0.5 });
    World.add(engine.world, [
      // walls

      Bodies.rectangle(0, height / 2, wallthick, height, { isStatic: true }), //left
      Bodies.rectangle(width, height / 2, wallthick, height, {
        isStatic: true,
      }), //right
      Bodies.rectangle(width / 2, 0, width, wallthick, { isStatic: true }), // top
      Bodies.rectangle(width / 2, height, width, wallthick, { isStatic: true }), // bottom
    ]);

    World.add(engine.world, [ballA, ballB]);

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

    World.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, "mousedown", function (event) {
      World.add(engine.world, Bodies.circle(150, 50, 30, { restitution: 0.7 }));
    });

    Engine.run(engine);

    Render.run(render);
  }

  render() {
    return <Container ref="scene" />;
  }
}
export default Scene;
