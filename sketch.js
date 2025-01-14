const WIDTH = 800;
const HEIGHT = 600;
const graph_poll_interval = 0.5;
const tick_interval = 0.1;

const PEOPLE_LIMIT = 1000;

const xoffset =15;
const yoffset = 5;

var persons;

var time;

var healthy;
var infected;
var removed;

var last_time;
var paused;

var tahoma;

var deltaTime;
p5.disableFriendlyErrors = true;
function plot() {
    let maxPoints = Math.max(Math.max(healthy.length, infected.length), removed.length);

    let graphIntervalX = WIDTH / maxPoints;
    let graphIntervalY = HEIGHT / persons.length;

    strokeWeight(2);

    //drawGrid(graphIntervalX,graphIntervalY,maxPoints,persons.length);

    stroke(0);
    line(xoffset+WIDTH,0,xoffset+WIDTH,HEIGHT);
    line(xoffset+WIDTH,HEIGHT,xoffset+WIDTH*2,HEIGHT);

    
    stroke(42, 148, 38);
    for (let i = 0; i < healthy.length - 1; i++)
        line(xoffset + WIDTH + graphIntervalX * i, HEIGHT - graphIntervalY * healthy[i] - yoffset, WIDTH + xoffset + graphIntervalX * (i + 1), HEIGHT - graphIntervalY * healthy[i + 1] - yoffset);
    stroke(224, 76, 76);
    for (let i = 0; i < infected.length - 1; i++)
        line(xoffset + WIDTH + graphIntervalX * i, HEIGHT - graphIntervalY * infected[i] - yoffset, WIDTH + xoffset + graphIntervalX * (i + 1), HEIGHT - graphIntervalY * infected[i + 1] - yoffset);
    stroke(25,98,230);
    for (let i = 0; i < removed.length - 1; i++)
        line(xoffset + WIDTH + graphIntervalX * i, HEIGHT - graphIntervalY * removed[i] - yoffset, WIDTH + xoffset + graphIntervalX * (i + 1), HEIGHT - graphIntervalY * removed[i + 1] - yoffset);

        /*
    noFill();

    stroke(42, 148, 38);
    beginShape();
    for (let i = 0; i < healthy.length - 1; i++)
        vertex(xoffset+WIDTH+graphIntervalX*i,HEIGHT-graphIntervalY*healthy[i]-yoffset);
    endShape();

    stroke(224, 76, 76);
    beginShape();
    for (let i = 0; i < healthy.length - 1; i++)
        vertex(xoffset+WIDTH+graphIntervalX*i,HEIGHT-graphIntervalY*infected[i]-yoffset);
    endShape();

    stroke(25,98,230);
    beginShape();
    for (let i = 0; i < healthy.length - 1; i++)
        vertex(xoffset+WIDTH+graphIntervalX*i,HEIGHT-graphIntervalY*removed[i]-yoffset);
    endShape();
    */
}
function pollData() {
    let inf = 0;
    let rm = 0;
    let hl=0;
    for (person of persons) {
        if (person.state == states.INFECTED)
            inf++;
        else if (person.state==states.RECOVERED)
            rm++;
        else if(person.state==states.HEALTHY)
            hl++;
    }
    infected.push(inf);
    removed.push(rm);
    healthy.push(hl);
}
function init()
{
    persons=[];

    let patient_zero = new Person();
    patient_zero.state = states.INFECTED;
    patient_zero.infection_time = 0;
    patient_zero.showRadius = true;
    persons.push(patient_zero);

    for (let i = 1; i < PEOPLE_LIMIT; i++)
        persons.push(new Person());
    time = 0;


    patient_zero.pos=[WIDTH/2 + (Math.random()*2-1)*WIDTH/8,HEIGHT/2 + (Math.random()*2-1)*HEIGHT/8];

    last_time = time;

    healthy=[PEOPLE_LIMIT-1];
    infected=[1];
    removed=[0];

    paused = true;
}
function preload()
{
    tahoma=loadFont("tahoma.ttf");
}
function setup() {
    createCanvas(WIDTH * 2, HEIGHT+70).parent('canvas');
    //Old javascript Hmmmmmm
    let pauseBtn=document.getElementById("pauseBtn");
    pauseBtn.onclick=function(){
        paused=!paused;
        this.innerHTML=paused?"Play":"Pause";
    };

    document.getElementById("resetBtn").onclick=()=>{
        init();
        pauseBtn.innerHTML="Play";
    };

    document.getElementById("infection_probSlider").addEventListener("change",function(){
        infection_prob=this.value/100;
        console.log(infection_prob);
    });

    document.getElementById("death_probSlider").addEventListener("change",function(){
        death_prob=this.value/100;
        console.log(death_prob);
    });

    document.getElementById("inc_periodSlider").addEventListener("change",function(){
        incubation_period=this.value;
        console.log(incubation_period);
    });

    document.getElementById("inf_radSlider").addEventListener("change",function(){
        infection_distance=this.value;
        console.log(infection_distance);
    });

    textFont(tahoma);
    init();
}
function update() {
    for (let i = 0; i < persons.length; i++) {
        persons[i].update();
        for (let j = i + 1; j < persons.length; j++)
            persons[i].interact(persons[j]);
    }
}
function draw() {
        let fps=frameRate();
        deltaTime=1/fps;
        noStroke();
        background(51);

        if(!paused)
        {
            update();
            time += tick_interval;

            if (infected[infected.length-1]>0 && time - last_time > graph_poll_interval) {
                pollData();
                last_time = time;
            }
        }

        for (person of persons)
            person.draw();

        fill(255);

        rect(WIDTH, 0, WIDTH * 2, HEIGHT+70);
        plot();


        textSize(25);
        noStroke();

        textAlign(LEFT);

        text(`Time: ${Math.round(time)} Ptrans: ${Math.round(infection_prob*100)}% Pmort: ${Math.round(death_prob*100)}% Inc Period: ${incubation_period} Inf Rad: ${infection_distance}`,10,HEIGHT+30);

        fill(0);
        textSize(30);

        let curHealthy=healthy[healthy.length - 1];
        let curInfected=infected[infected.length-1];
        let curRecov=removed[removed.length-1];

        text(`Healthy: ${curHealthy} Infected: ${curInfected} Deaths: ${PEOPLE_LIMIT-curHealthy-curInfected-curRecov} Recovered: ${curRecov}`, WIDTH + xoffset+10, HEIGHT+30);

        fill(42, 148, 38);
        rect(WIDTH+xoffset+50,HEIGHT+30+10,15,15);

        fill(224, 76, 76);
        rect(WIDTH+xoffset+50+180,HEIGHT+30+10,15,15);

        fill(25,98,230);
        rect(WIDTH+xoffset+50+170+320,HEIGHT+30+10,15,15);


        textSize(20);
        fill(0);
        text("FPS:"+Math.round(fps),WIDTH*2-110,20);
}