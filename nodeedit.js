var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ARROW_SIZE = 6;

function renderArrowRight(ctx, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(toX + ARROW_SIZE, toY);
    ctx.lineTo(toX, toY - ARROW_SIZE / 2);
    ctx.lineTo(toX, toY + ARROW_SIZE / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function renderArrowLeft(ctx, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(toX - ARROW_SIZE, toY);
    ctx.lineTo(toX, toY - ARROW_SIZE / 2);
    ctx.lineTo(toX, toY + ARROW_SIZE / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function renderArrowDown(ctx, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(toX, toY + ARROW_SIZE);
    ctx.lineTo(toX - ARROW_SIZE / 2, toY);
    ctx.lineTo(toX + ARROW_SIZE / 2, toY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function renderArrowUp(ctx, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(toX, toY - ARROW_SIZE);
    ctx.lineTo(toX - ARROW_SIZE / 2, toY);
    ctx.lineTo(toX + ARROW_SIZE / 2, toY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function renderArrow(ctx, isHorizontal, fromX, fromY, toX, toY) {
    if (isHorizontal) {
        if (toX + ARROW_SIZE > fromX) {
            renderArrowRight(ctx, toX, toY);
        }
        else {
            renderArrowLeft(ctx, toX, toY);
        }
    }
    else {
        if (toY + ARROW_SIZE > fromY) {
            renderArrowDown(ctx, toX, toY);
        }
        else {
            renderArrowUp(ctx, toX, toY);
        }
    }
}
function Connector(from, to) {
    this.from = from;
    this.to = to;

    this.render = function (ctx) {
        var midX, midY, c1x, c1y, c2x, c2y;

        var isHorizontal;
        var isOverlap = false;

        var fromX = this.from.x;
        var fromY = this.from.y;
        var toX = this.to.x;
        var toY = this.to.y;

        if (this.from.x + this.from.width < this.to.x) {
            isHorizontal = true;
            fromX += this.from.width;
            fromY += this.from.height / 2;
            toX -= ARROW_SIZE;
            toY += this.to.height / 2;
        }
        else if (this.from.x > this.to.x + this.to.width) {
            isHorizontal = true;
            fromY += this.from.height / 2;
            toX += this.to.width + ARROW_SIZE;
            toY += this.to.height / 2;
        }
        else if (this.from.y + this.from.height < this.to.y) {
            isHorizontal = false;
            fromX += this.from.width / 2;
            fromY += this.from.height;
            toX += this.to.width / 2;
            toY -= ARROW_SIZE;
        }
        else if (this.from.y > this.to.y + this.to.height) {
            isHorizontal = false;
            fromX += this.from.width / 2;
            toX += this.to.width / 2;
            toY += this.to.height + ARROW_SIZE;
        }
        else {
            isOverlap = true;
            fromX += this.from.width / 2;
            fromY += this.from.height / 2;
            toX += this.to.width / 2;
            toY += this.to.height / 2;
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
            ctx.stroke();
            renderArrow(ctx, isHorizontal, fromX, fromY, toX, toY);
        }
    }
}

function Node(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 30;
    this.isHighlighted = false;
    this.isSelected = false;

    this.render = function (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.isSelected) {
            ctx.strokeStyle = "blue";
        }
        else if (this.isHighlighted) {
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
}


function MouseCoordsToCanvas(event) {
    var bRect = canvas.getBoundingClientRect();
    var mouseX = (event.clientX - bRect.left) * (canvas.width / bRect.width);
    var mouseY = (event.clientY - bRect.top) * (canvas.height / bRect.height);
    return {x: mouseX, y: mouseY};
}


function Scene() {
    this.nodes = [];
    this.connectors = [];

    this.nodeUnderCursor = null;
    this.isDragging = false;
    this.nodeDragged = null;
    this.connectorDragged = null;
    this.lastMousePos = null;
    this.selected = null;

    this.addNode = function (node) {
        this.nodes[this.nodes.length] = node;
    };

    this.removeNode = function (node) {
        var ix = this.nodes.indexOf(node);
        this.nodes.splice(ix, 1);
        if (node == this.selected) {
            this.selected = null;
        }
        this.removeConnectorsForNode(node);
    }

    this.removeConnectorsForNode = function (node) {
        var newConnectors = [];
        var i;
        for(i = 0; i < this.connectors.length; ++i) {
            var connector = this.connectors[i];
            if (connector.from != node && connector.to != node) {
                newConnectors.push(connector);
            }
        }
        this.connectors = newConnectors;
    }

    this.addConnector = function (connector) {
        this.connectors.push(connector);
    }

    this.render = function (ctx) {
        var i;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        var i;
        for (i = 0; i < this.connectors.length; ++i) {
            this.connectors[i].render(ctx);
        }

        if (this.connectorDragged) {
            this.connectorDragged.render(ctx);
        }

        for (i = this.nodes.length - 1; i >= 0; --i) {
            this.nodes[i].render(ctx);
        }

    };

    this.onMouseDown = function (x, y, event) {
        console.log("mousedown:", x, y, event.altKey);
        var node = this.pick(x, y);
        if (node) {
            if (event.altKey) {
                this.connectorDragged = new Connector(node, {x: x, y: y, width: 1, height: 1});
            }
            else {
                this.nodeDragged = node;
                var ix = this.nodes.indexOf(node);
                if (ix > 0) {
                    this.nodes.splice(ix, 1);
                    this.nodes.splice(0, 0, node);
                }
                if (this.selected && this.selected != node) {
                    this.selected.isSelected = false;
                }
                node.isSelected = !node.isSelected;
                if (node.isSelected) {
                    this.selected = node;
                }
            }
        }

        this.render(ctx);
    };

    this.onMouseMove = function (x, y) {
        if (this.lastMousePos == null) {
            this.lastMousePos = {x: x, y: y}
        }

        if (this.nodeDragged) {
            var dx = x - this.lastMousePos.x;
            var dy = y - this.lastMousePos.y;
            this.nodeDragged.x += dx;
            this.nodeDragged.y += dy;
            this.isDragging = true;
        }
        else if (this.connectorDragged) {
            var to = this.pick(x, y);
            if (!to) {
                to = {x: x, y: y, width: 1, height: 1};
            }
            this.connectorDragged.to = to;
        }
        else {
            var node = this.pick(x, y);
            if (node != this.nodeUnderCursor) {
                if (this.nodeUnderCursor) {
                    this.nodeUnderCursor.isHighlighted = false;
                }
                this.nodeUnderCursor = node;
                if (this.nodeUnderCursor) {
                    this.nodeUnderCursor.isHighlighted = true;
                }
            }
        }

        this.render(ctx);

        this.lastMousePos = {x: x, y: y};
    };

    this.onMouseUp = function (x, y) {
        if (!this.isDragging && this.nodeDragged && this.nodeDragged.isSelected) {
            this.nodeDragged.isSelected = false;
            this.selected = null;
        }

        if (this.connectorDragged) {
            var node = this.pick(x, y);
            if (node && node != this.connectorDragged.from) {
                this.connectorDragged.to = node;
                this.connectors.push(this.connectorDragged);
            }
            this.connectorDragged = null;
        }

        this.isDragging = false;
        this.nodeDragged = null;
        this.render(ctx);
    };

    this.pick = function (x, y) {
        var i;
        for (i = 0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            if (node.isInside(x, y)) {
                return node;
            }
        }

        return null;
    };

}

scene = new Scene();

function OnMouseDown(event) {
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseDown(coords.x, coords.y, event)
    event.preventDefault();
}

function OnMouseMove(event) {
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseMove(coords.x, coords.y)
    event.preventDefault();
}

function OnMouseUp(event) {
    var coords = MouseCoordsToCanvas(event);
    scene.onMouseUp(coords.x, coords.y)
    event.preventDefault();
}

canvas.addEventListener("mousedown", OnMouseDown);
canvas.addEventListener("mousemove", OnMouseMove);
canvas.addEventListener("mouseup", OnMouseUp);

function onClickAdd() {
    var name = document.getElementById('name').value;
    var node = new Node(name, 0, 0)
    scene.addNode(node);
    scene.render(ctx);
}

function onClickDelete() {
    if (scene.selected) {
        scene.removeNode(scene.selected);
        scene.render(ctx);
    }
}

var first = new Node("First", 20, 20);
var second = new Node("Second", 60, 200);
var third = new Node("Third", 150, 140);
scene.addNode(first);
scene.addNode(second);
scene.addNode(third);
scene.render(ctx);