var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ARROW_SIZE = 6;


function Node(name, x, y)
{
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 30;
    this.isHighlighted = false;
    this.connectedTo = [];

    this.render = function (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.isHighlighted) {
            ctx.strokeStyle = "red";
        }
        else {
            ctx.strokeStyle = "black";
        }
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.font = "10px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        var halfWidth = this.width / 2;
        var halfHeight = this.height / 2;
        ctx.fillText(this.name, this.x + halfWidth, this.y + halfHeight);

        ctx.lineWidth = 2;

        var i;
        for (i = 0; i < this.connectedTo.length; ++i) {
            var other = this.connectedTo[i];
            var fromX, fromY, toX, toY, midX, midY;
            var c1x, c1y, c2x, c2y;

            var isHorizontal;
            var isOverlap = false;

            if (this.x + this.width < other.x) {
                isHorizontal = true;
                fromX = this.x + this.width;
                fromY = this.y + halfHeight;
                toX = other.x - ARROW_SIZE;
                toY = other.y + other.height / 2;
            }
            else if (this.x > other.x + other.width) {
                isHorizontal = true;
                fromX = this.x;
                fromY = this.y + halfHeight;
                toX = other.x + other.width + ARROW_SIZE;
                toY = other.y + other.height / 2;
            }
            else if (this.y + this.height < other.y) {
                isHorizontal = false;
                fromX = this.x + halfWidth;
                fromY = this.y + this.height;
                toX = other.x + other.width / 2;
                toY = other.y - ARROW_SIZE;
            }
            else if (this.y > other.y + other.height) {
                isHorizontal = false;
                fromX = this.x + halfWidth;
                fromY = this.y;
                toX = other.x + other.width / 2;
                toY = other.y + other.height + ARROW_SIZE;
            }
            else {
                isOverlap = true;
                fromX = this.x + halfWidth;
                fromY = this.y + halfHeight;
                toX = other.x + other.width / 2;
                toY = other.y + other.height / 2;
            }

            midX = fromX + (toX - fromX) / 2;
            midY = fromY + (toY - fromY) / 2;

            if (isHorizontal) {
                c1x = midX;
                c1y = fromY;
                c2x = midX;
                c2y = toY;
            }
            else {
                c1x = fromX;
                c1y = midY;
                c2x = toX;
                c2y = midY;
            }

            if (!isOverlap) {
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);

                ctx.quadraticCurveTo(
                    c1x, c1y,
                    midX, midY
                );
                ctx.quadraticCurveTo(
                    c2x, c2y,
                    toX, toY
                );
                // ctx.lineTo(midX, midY);
                ctx.stroke();

                ctx.beginPath();
                if (isHorizontal) {
                    if (toX + ARROW_SIZE > fromX) {
                        ctx.moveTo(toX + ARROW_SIZE, toY);
                        ctx.lineTo(toX, toY - ARROW_SIZE / 2);
                        ctx.lineTo(toX, toY + ARROW_SIZE / 2);
                    }
                    else {
                        ctx.moveTo(toX - ARROW_SIZE, toY);
                        ctx.lineTo(toX, toY - ARROW_SIZE / 2);
                        ctx.lineTo(toX, toY + ARROW_SIZE / 2);
                    }
                }
                else {
                    if (toY + ARROW_SIZE > fromY) {
                        ctx.moveTo(toX, toY + ARROW_SIZE);
                        ctx.lineTo(toX - ARROW_SIZE / 2, toY);
                        ctx.lineTo(toX + ARROW_SIZE / 2, toY);
                    }
                    else {
                        ctx.moveTo(toX, toY - ARROW_SIZE);
                        ctx.lineTo(toX - ARROW_SIZE / 2, toY);
                        ctx.lineTo(toX + ARROW_SIZE / 2, toY);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            }
        }
    };

    this.isInside = function (x, y) {
        if (x < this.x) {
            return false;
        }
        if (y < this.y) {
            return false;
        }
        if (x > this.x + this.width) {
            return false;
        }
        if (y > this.y + this.height) {
            return false;
        }

        return true;
    };

    this.setHighlight = function (val) {
        this.isHighlighted = val;
    };

    this.connectTo = function(node)
    {
        this.connectedTo.push(node);
    };
}


function MouseCoordsToCanvas(event)
{
    var bRect = canvas.getBoundingClientRect();
    var mouseX = (event.clientX - bRect.left) * (canvas.width / bRect.width);
    var mouseY = (event.clientY - bRect.top) * (canvas.height / bRect.height);
    return {x: mouseX, y: mouseY};
}


function Scene()
{
    this.nodes = [];

    this.nodeUnderCursor = null;
    this.nodeDragged = null;
    this.lastMousePos = null;

    this.addNode = function(node)
    {
        this.nodes[this.nodes.length] = node;
    };

    this.render = function(ctx)
    {
        var i;

        if( this.nodes.length == 0)
        {
            return;
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for( i = this.nodes.length - 1; i >= 0; --i )
        {
            this.nodes[i].render(ctx);
        }
    };

    this.onMouseDown = function(x, y)
    {
        var node = this.pick(x, y);
        if( node )
        {
            this.nodeDragged = node;
            var ix = this.nodes.indexOf(node);
            this.nodes.splice(ix, 1);
            this.nodes.splice(0, 0, node);
        }

        this.render(ctx)
    };

    this.onMouseMove = function(x, y)
    {
        if( this.lastMousePos == null )
        {
            this.lastMousePos = {x: x, y: y}
        }

        if( this.nodeDragged )
        {
            var dx = x - this.lastMousePos.x;
            var dy = y - this.lastMousePos.y;
            this.nodeDragged.x += dx;
            this.nodeDragged.y += dy;
        }
        else
        {
            var node = this.pick(x, y);
            if( node != this.nodeUnderCursor )
            {
                if( this.nodeUnderCursor )
                {
                    this.nodeUnderCursor.setHighlight(false);
                }
                if( node )
                {
                    node.setHighlight(true);
                    this.nodeUnderCursor = node;
                }
            }
        }

        this.render(ctx);

        this.lastMousePos = {x: x, y: y};
    };

    this.onMouseUp = function(x, y)
    {
        this.nodeDragged = null;
        this.render(ctx);
    };

    this.pick = function(x, y)
    {
        var i;
        for( i = 0; i < this.nodes.length; ++i )
        {
            var node = this.nodes[i];
            if( node.isInside(x, y) )
            {
                return node;
            }
        }

        return null;
    };

}

scene = new Scene();

function OnMouseDown(event)
{
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseDown(coords.x, coords.y)
}

function OnMouseMove(event)
{
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseMove(coords.x, coords.y)
}

function OnMouseUp(event)
{
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseUp(coords.x, coords.y)
}

canvas.addEventListener("mousedown", OnMouseDown);
canvas.addEventListener("mousemove", OnMouseMove);
canvas.addEventListener("mouseup", OnMouseUp);

var first = new Node("First", 20, 20);
var second = new Node("Second", 60, 200);
var third = new Node("Third", 150, 140);
first.connectTo(second);
// first.connectTo(third);
second.connectTo(third);
scene.addNode(first);
scene.addNode(second);
scene.addNode(third);
scene.render(ctx);