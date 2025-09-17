const { Engine, Body, Bodies, Composite, Constraint, Common, Events, Vector, Render, Runner, Mouse, MouseConstraint } = Matter;

let engine, render, runner;

const elementContainer = document.getElementById('animatedHeader');
const windWidth = elementContainer.clientWidth;
const windHeight = elementContainer.clientHeight;

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});


function setup() {
    noCanvas();
    engine = Engine.create();
    engine.gravity. y = 0;
    render = Render.create({
        element: elementContainer,
        engine: engine,
        options: {
            width: windWidth,
            height: windHeight,
            wireframes: false,
            background: 'transparent',
        }
    });


    const xx = windWidth / 2;
    const yy = windHeight / 2;


    let base = Bodies.circle(windWidth / 2, windHeight / 2, 10, {
        isStatic: true,
        isSensor: true,
        collisionFilter: { group: -1 },
        render: {
            visible: false,
        }
    });

    Composite.add(engine.world, [base])

    const arms = [];
    const polys = [];

    // const armLength = 360;
    const numSpokes = 200;

    for (let i = 0; i < numSpokes; i++) {

        let group = Body.nextGroup(true);

        const armLength = Math.floor(200 + Common.random() * (600 - 200));

        const angle =  Math.PI * i / numSpokes;

        const armStartPosition = Vector.create(xx, yy);

      // const armX = xx + Math.cos(angle) * (armLength / 4);
        // const armY = yy + Math.sin(angle) * (armLength / 4);

        const arm = Bodies.rectangle(
            // xx,
            // yy,
            // armX,
            // armY,
            armStartPosition.x,
            armStartPosition.y,
            armLength,
            1,
            {
            isSensor: true,
            friction: 0,
            frictionAir: 0,
            collisionFilter: { group },
            render: { visible: false }
            });

        Body.setAngle(arm, angle);

        const polyStartPosition = Vector.add(
            armStartPosition,
            Vector.mult(Vector.rotate(Vector.create(armLength / 2, 0), angle), 1)
        );

        // const polyX = xx + Math.cos(angle) * armLength / 2;
        // const polyY = yy + Math.sin(angle) * armLength / 2;


        const poly = Bodies.polygon(
            // polyX,
            // polyY,
            polyStartPosition.x,
            polyStartPosition.y,
            6,
            25,
            { 
                collisionFilter: { group },
                render: { 
                    visible: true,
                    sprite: {
                        texture: './src/img/icons/img' + Math.floor(1 + Math.random() * (5 - 1)) + '.png',
                        yScale: 0.5,
                        xScale: 0.5
                 },
                 options: {
                    pixelRatio: 2,
                 }
            }
            }
        );

        const axel = Constraint.create({
            bodyA: arm,
            pointA: { x: -armLength / 2, y: 0 },
            bodyB: base,
            pointB: { x: 0, y: 0 },
            stiffness: 1,
            length: 0,
            render: {
                visible: false,
            }
        });

        const polyJoint = Constraint.create({
            bodyA: arm,
            pointA: { x: armLength / 2, y: 0 },
            bodyB: poly,
            pointB: { x: 0, y: 0 },
            stiffness: 1,
            length: 50,
            render: {
                visible: false,
            }
        });

        arms.push(arm);
        polys.push(poly);

        Composite.add(engine.world, [arm, poly, axel, polyJoint]);


        let frameCounter = 0;
        const stabilizationFrames = 240;

        Events.on(engine, "beforeUpdate", () => {
            if (frameCounter < stabilizationFrames) {
                frameCounter++;
                return; // Пропускаем вращение в течение первых 60 кадров
            }
            const armSpeed = -0.004;
            const polySpin = 0.005;
            for (const a of arms) Body.setAngularVelocity(a, armSpeed);
            for (const p of polys) Body.setAngularVelocity(p, polySpin);
        });
     

    }

    window.addEventListener('resize', () => {

        const newWidth = elementContainer.clientWidth;
        const newHeight = elementContainer.clientHeight;

        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        render.options.width = newWidth;
        render.options.height = newHeight;

        Body.setPosition(base, { x: newWidth / 2, y: newHeight / 2});

        // console.log(circle.position);

    });
  
    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

};
