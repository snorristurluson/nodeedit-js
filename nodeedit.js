var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function NodeRender(ctx)
{
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if( this.isHighlighted )
    {
        ctx.strokeStyle = "red";
    }
    else
    {
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
}

function NodeSetHighlight(val)
{
    this.isHighlighted = val;
}

function NodeIsInside(x, y)
{
    if( x < this.x )
    {
        return false;
    }
    if( y < this.y )
    {
        return false;
    }
    if( x > this.x + this.width )
    {
        return false;
    }
    if( y > this.y + this.height )
    {
        return false;
    }

    return true;
}

function Node(name, x, y)
{
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 30;
    this.isHighlighted = false;

    this.render = NodeRender;
    this.isInside = NodeIsInside;
    this.setHighlight = NodeSetHighlight
}

function SceneAddNode(node)
{
    this.nodes[this.nodes.length] = node;
}

function SceneRender(ctx)
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
}

function MouseCoordsToCanvas(event)
{
    var bRect = canvas.getBoundingClientRect();
    var mouseX = (event.clientX - bRect.left) * (canvas.width / bRect.width);
    var mouseY = (event.clientY - bRect.top) * (canvas.height / bRect.height);
    return {x: mouseX, y: mouseY};
}

function SceneOnMouseMove(x, y)
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
}

function SceneOnMouseDown(x, y)
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
}

function SceneOnMouseUp(x, y)
{
    this.nodeDragged = null;
    this.render(ctx)
}

function ScenePick(x, y)
{
    for( i = 0; i < this.nodes.length; ++i )
    {
        var node = this.nodes[i];
        if( node.isInside(x, y) )
        {
            return node;
        }
    }

    return null;
}

function Scene()
{
    this.nodes = [];

    this.nodeUnderCursor = null;
    this.nodeDragged = null;
    this.lastMousePos = null;

    this.addNode = SceneAddNode;
    this.render = SceneRender;
    this.onMouseDown = SceneOnMouseDown;
    this.onMouseMove = SceneOnMouseMove;
    this.onMouseUp = SceneOnMouseUp;
    this.pick = ScenePick;
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

scene.addNode(new Node("First", 20, 20));
scene.addNode(new Node("Second", 60, 20));
scene.addNode(new Node("Third", 50, 40));
scene.render(ctx);