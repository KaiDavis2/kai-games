// 🐋 Whale Run v11 — Pure flow, no smash. Dodge, collect, grow.
const W=800,H=600;
const LEVELS=[
    {name:'THE SHALLOWS',depth:200,color:'#66bbff',bg:0x0a0a3e,rockRate:1500,maxRocks:2,speed:2.5},
    {name:'CORAL GARDEN',depth:400,color:'#44aadd',bg:0x080838,rockRate:1200,maxRocks:3,speed:2.8},
    {name:'THE DEEP',depth:700,color:'#2288bb',bg:0x060628,rockRate:900,maxRocks:3,speed:3.2},
    {name:'THE ABYSS',depth:1000,color:'#ff8844',bg:0x050518,rockRate:700,maxRocks:4,speed:3.5},
    {name:'THE TRENCH',depth:1500,color:'#ff4444',bg:0x100510,rockRate:550,maxRocks:5,speed:4.0},
];
const TREASURES=['Pearl','Shell','Crown','Trident','Heart'];

class Preload extends Phaser.Scene{
    constructor(){super('Preload');}
    preload(){
        this.load.image('bg','assets/ocean-bg.jpg');
        this.load.audio('bgm','assets/bgm.mp3');
        ['whale','whale-power','tailup','taildown','star','bubble','shrimp','jellyfish','treasure','rock','rock-small','rock-med','rock-big'].forEach(k=>{
            this.load.image(k,'assets/'+k+'.png');
        });
    }
    create(){this.scene.start('Title');}
}

class Title extends Phaser.Scene{
    constructor(){super('Title');}
    create(){
        // Ocean gradient background
        const g=this.add.graphics().setDepth(0);
        g.fillGradientStyle(0x0a0a4e,0x0a0a4e,0x000011,0x000011,1,1,1,1);g.fillRect(0,0,W,H);

        // Bubbles
        for(let i=0;i<20;i++){
            const b=this.add.circle(Phaser.Math.Between(50,W-50),Phaser.Math.Between(100,H),Phaser.Math.Between(2,6),0x3399ff,Phaser.Math.FloatBetween(0.05,0.2)).setDepth(1);
            this.tweens.add({targets:b,y:b.y-200,duration:Phaser.Math.Between(3000,8000),repeat:-1,onRepeat:()=>{b.x=Phaser.Math.Between(50,W-50);b.y=H+20;}});
        }

        // Swimming whale — the star of the show
        const whale=this.add.image(-80,H/2+20,'whale').setScale(3).setDepth(5);
        const tail=this.add.image(-120,H/2+20,'tailup').setScale(3).setDepth(5);
        this.tweens.add({targets:[whale,tail],x:150,duration:2500,ease:'Power2',delay:200});
        this.tweens.add({targets:whale,y:H/2+10,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        this.tweens.add({targets:tail,y:H/2+10,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});

        // Tail flap
        let flap=true;
        this.time.addEvent({delay:300,loop:true,callback:()=>{
            tail.setTexture(flap?'taildown':'tailup');flap=!flap;
        }});

        // Bubble trail behind whale
        this.time.addEvent({delay:200,loop:true,callback:()=>{
            const bx=whale.x-30,by=whale.y+Phaser.Math.Between(-8,8);
            const bub=this.add.circle(bx,by,Phaser.Math.Between(2,4),0x66ccff,0.4).setDepth(4);
            this.tweens.add({targets:bub,x:bx-60,alpha:0,duration:Phaser.Math.Between(400,800),onComplete:()=>bub.destroy()});
        }});

        // Title
        const title=this.add.text(W/2,80,'🐋 WHALE RUN',{fontSize:'52px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffffff',stroke:'#004488',strokeThickness:12}).setOrigin(0.5).setDepth(10).setAlpha(0);
        this.tweens.add({targets:title,alpha:1,duration:800,delay:600});
        this.tweens.add({targets:title,y:75,duration:1500,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});

        const sub=this.add.text(W/2,135,'Dodge the rocks. Collect the stars. Grow big.',{fontSize:'14px',fontFamily:'Courier New',color:'#88bbee'}).setOrigin(0.5).setDepth(10).setAlpha(0);
        this.tweens.add({targets:sub,alpha:1,duration:600,delay:1200});

        // Ocean Relic progress
        const pr=JSON.parse(localStorage.getItem('whaleProgress')||'{"unlocked":1,"treasures":[]}');
        if(pr.treasures.length>0){
            let rs='';for(let i=0;i<5;i++)rs+=pr.treasures.includes(i)?'['+TREASURES[i][0]+'] ':'[ ] ';
            const relic=this.add.text(W/2,165,'RELIC: '+rs,{fontSize:'12px',fontFamily:'Courier New',color:'#ffcc33'}).setOrigin(0.5).setDepth(10).setAlpha(0);
            this.tweens.add({targets:relic,alpha:0.8,duration:400,delay:1500});
        }

        // DIVE button
        const btn=this.add.rectangle(W/2,H-120,220,55,0x1155aa,0.9).setDepth(10).setAlpha(0);
        this.tweens.add({targets:btn,alpha:1,duration:500,delay:1800});
        const btnText=this.add.text(W/2,H-120,'DIVE IN',{fontSize:'28px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffffff'}).setOrigin(0.5).setDepth(11).setAlpha(0);
        this.tweens.add({targets:btnText,alpha:1,duration:500,delay:1800});

        // Pulse the button
        this.tweens.add({targets:[btn,btnText],scaleX:1.05,scaleY:1.05,duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut',delay:2400});

        btn.setInteractive({useHandCursor:true});
        btn.on('pointerdown',()=>this.scene.start('LevelSelect'));
        btn.on('pointerover',()=>btn.setFillStyle(0x2266cc,1));
        btn.on('pointerout',()=>btn.setFillStyle(0x1155aa,0.9));

        // Tap/click anywhere also works
        this.input.on('pointerdown',()=>this.scene.start('LevelSelect'));

        // Tiny instruction
        const foot=this.add.text(W/2,H-40,'tap or press DIVE',{fontSize:'10px',fontFamily:'Courier New',color:'#334466'}).setOrigin(0.5).setDepth(10).setAlpha(0);
        this.tweens.add({targets:foot,alpha:0.6,duration:500,delay:2500});
    }
}

class LevelSelect extends Phaser.Scene{
    constructor(){super('LevelSelect');}
    create(){
        this.add.rectangle(W/2,H/2,W,H,0x060620).setDepth(0);

        // Bubbles
        for(let i=0;i<10;i++){
            this.add.circle(Phaser.Math.Between(50,W-50),Phaser.Math.Between(50,H),Phaser.Math.Between(1,4),0x3399ff,Phaser.Math.FloatBetween(0.03,0.1)).setDepth(1);
        }

        this.add.text(W/2,30,'CHOOSE YOUR DIVE',{fontSize:'22px',fontFamily:'Courier New',fontStyle:'bold',color:'#88ccff'}).setOrigin(0.5).setDepth(5);
        const pr=JSON.parse(localStorage.getItem('whaleProgress')||'{"unlocked":1,"treasures":[]}');

        // Ocean Relic
        this.add.text(W/2,65,'OCEAN RELIC',{fontSize:'13px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffaa22'}).setOrigin(0.5).setDepth(5);
        let rs='';for(let i=0;i<5;i++)rs+=pr.treasures.includes(i)?'['+TREASURES[i][0]+'] ':'[ ] ';
        this.add.text(W/2,85,rs,{fontSize:'13px',fontFamily:'Courier New',color:'#ffdd44'}).setOrigin(0.5).setDepth(5);
        if(pr.treasures.length>=5)this.add.text(W/2,108,'🏆 RELIC COMPLETE! 🏆',{fontSize:'16px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffaa22'}).setOrigin(0.5).setDepth(5);

        // Level cards — visual ocean depth bands
        for(let i=0;i<5;i++){
            const lv=LEVELS[i],y=150+i*80,ul=i<pr.unlocked,dn=pr.treasures.includes(i);
            // Depth band
            const band=this.add.rectangle(W/2,y,560,65,ul?(dn?0x0a2a1a:0x0a1a3a):0x080818,ul?0.85:0.4).setDepth(5);
            // Depth gradient line on left
            const bar=this.add.rectangle(W/2-270,y,4,55,Phaser.Display.Color.HexStringToColor(lv.color).color,ul?0.8:0.2).setDepth(6);

            // Level name
            this.add.text(W/2-250,y-12,lv.name,{fontSize:'16px',fontFamily:'Courier New',fontStyle:'bold',color:ul?lv.color:'#2a2a3a'}).setDepth(6);
            // Depth + stats
            this.add.text(W/2-250,y+10,lv.depth+'m  •  '+(dn?TREASURES[i]+' ✅':'Reach the '+TREASURES[i]),{fontSize:'11px',fontFamily:'Courier New',color:ul?'#6688aa':'#222233'}).setDepth(6);

            if(ul){
                // Play indicator
                const play=this.add.text(W/2+230,y,'▸',{fontSize:'28px',fontFamily:'Courier New',color:'#ffdd44'}).setOrigin(0.5).setDepth(6);
                band.setInteractive({useHandCursor:true});
                band.on('pointerdown',()=>this.scene.start('Game',{level:i}));
                band.on('pointerover',()=>{band.setFillStyle(dn?0x1a3a2a:0x1a2a4a,0.95);play.setColor('#ffffff');});
                band.on('pointerout',()=>{band.setFillStyle(dn?0x0a2a1a:0x0a1a3a,0.85);play.setColor('#ffdd44');});
            }else{
                this.add.text(W/2+230,y,'🔒',{fontSize:'18px'}).setOrigin(0.5).setDepth(6);
            }
        }

        // Back button
        const back=this.add.text(W/2,H-30,'◂ back',{fontSize:'13px',fontFamily:'Courier New',color:'#556688'}).setOrigin(0.5).setDepth(5);
        back.setInteractive({useHandCursor:true});
        back.on('pointerdown',()=>this.scene.start('Title'));
        back.on('pointerover',()=>back.setColor('#88ccff'));
        back.on('pointerout',()=>back.setColor('#556688'));

        this.add.text(W/2,H-55,'⭐ Grow bigger = harder to dodge = higher score',{fontSize:'10px',fontFamily:'Courier New',color:'#334455'}).setOrigin(0.5).setDepth(5);
    }
}

class Game extends Phaser.Scene{
    constructor(){super('Game');}
    init(d){this.li=d.level||0;this.lv=LEVELS[this.li];this.td=this.lv.depth;}
    create(){
        this.score=0;this.over=false;this.won=false;
        this.st=0;this.sst=0;this.jt=0;this.sht=0;this.rt=0;
        this.size=1;this.fc=0;this.fps=6;this.combo=0;this.ct=0;
        this.depth=0;this.tsp=false;this.spd=this.lv.speed;

        // Background
        try{this.add.image(W/2,H/2,'bg').setDisplaySize(W,H).setAlpha(0.15);}catch(e){}
        const g=this.add.graphics().setDepth(1);
        g.fillGradientStyle(this.lv.bg,this.lv.bg,0x000011,0x000011,0.2,0.2,0.8,0.8);g.fillRect(0,0,W,H);

        // Bubbles
        this.bubs=[];for(let i=0;i<15;i++){
            const b=this.add.circle(Phaser.Math.Between(0,W),Phaser.Math.Between(0,H),Phaser.Math.Between(1,4),0x3399ff,0.1).setDepth(2);
            this.bubs.push(b);
        }

        // Groups
        this.rocks=this.add.group();this.stars=this.add.group();this.foods=this.add.group();this.jellies=this.add.group();

        // Whale
        this.wb=this.add.image(120,H/2,'whale').setScale(2).setDepth(10);
        this.wt=this.add.image(80,H/2,'tailup').setScale(2).setDepth(10);

        // Tail animation
        let flap=true;
        this.tailTimer=this.time.addEvent({delay:280,loop:true,callback:()=>{
            if(this.over)return;
            this.wt.setTexture(flap?'taildown':'tailup');flap=!flap;
        }});

        // Whale bob
        this.whaleBob=this.tweens.add({targets:this.wb,y:H/2+5,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        this.tweens.add({targets:this.wt,y:H/2+5,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});

        // HUD — depth bar
        this.add.rectangle(W/2,14,W-40,10,0x111133,0.8).setDepth(19);
        this.dbar=this.add.rectangle(21,14,4,8,0x3388cc).setOrigin(0,0.5).setDepth(20);
        this.dmrk=this.add.text(21,26,'0m',{fontSize:'10px',fontFamily:'Courier New',color:'#88ccff'}).setDepth(20);
        this.add.text(W-20,14,'💎',{fontSize:'14px'}).setOrigin(0.5,0.5).setDepth(20);

        // Score
        this.sT=this.add.text(W-20,34,'⭐ 0',{fontSize:'18px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffdd44',stroke:'#001133',strokeThickness:3}).setOrigin(1,0).setDepth(20);

        // Level name
        this.add.text(20,34,this.lv.name,{fontSize:'12px',fontFamily:'Courier New',color:this.lv.color}).setDepth(20);

        // Size indicator
        this.zT=this.add.text(W/2,34,'SIZE 1',{fontSize:'12px',fontFamily:'Courier New',color:'#88aacc'}).setOrigin(0.5,0).setDepth(20);

        // Growth bar
        this.add.rectangle(W/2,H-18,140,8,0x111133,0.8).setDepth(19);
        this.gbar=this.add.rectangle(W/2-66,H-18,4,6,0x3399dd).setOrigin(0,0.5).setDepth(20);
        this.glbl=this.add.text(W/2,H-18,'SIZE 1',{fontSize:'8px',fontFamily:'Courier New',color:'#ffffff',stroke:'#001133',strokeThickness:2}).setOrigin(0.5,0.5).setDepth(21);

        // Combo popup
        this.cT=this.add.text(W/2,H/2-100,'',{fontSize:'28px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffaa22',stroke:'#331100',strokeThickness:4}).setOrigin(0.5).setDepth(20).setAlpha(0);

        // Level intro
        const ann=this.add.text(W/2,H/2,this.lv.name+'\nDive '+this.td+'m for the '+TREASURES[this.li]+'\nDodge rocks • Collect stars',{fontSize:'24px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffffff',stroke:'#002244',strokeThickness:8}).setOrigin(0.5).setDepth(25);
        this.tweens.add({targets:ann,alpha:0,duration:2000,delay:1500});

        // Controls
        this.cursors=this.input.keyboard.createCursorKeys();
        this.input.on('pointermove',p=>{if(!this.over){this.wb.y=p.y;this.wt.y=p.y;this.whaleBob.stop();}});
        this.input.on('pointerdown',p=>{if(!this.over){this.wb.y=p.y;this.wt.y=p.y;this.whaleBob.stop();}});
    }

    gs(){return 1.8+(this.size-1)*0.5;} // Whale visual scale
    gr(){return 14+(this.size-1)*8;}      // Collision radius — grows faster = harder

    update(t,d){
        if(this.over)return;
        const dt=d/16.67;
        this.depth=Math.floor(t/100);

        // Treasure spawn at target depth
        if(this.depth>=this.td&&!this.tsp){
            this.tsp=true;
            const tr=this.add.image(W+30,H/2,'treasure').setScale(3).setDepth(8);
            tr.speedX=2;tr.isTreasure=true;
            this.tweens.add({targets:tr,y:tr.y+10,duration:600,yoyo:true,repeat:-1});
            this.stars.add(tr);
        }

        // Gradual speed increase
        if(this.depth%500<2&&this.spd<this.lv.speed+2)this.spd+=0.02;

        // Keyboard movement
        const ms=Math.max(2,5-(this.size-1)*0.3);
        if(this.cursors.up.isDown)this.wb.y-=ms*dt;
        if(this.cursors.down.isDown)this.wb.y+=ms*dt;
        if(this.cursors.left.isDown)this.wb.x-=3*dt;
        if(this.cursors.right.isDown)this.wb.x+=3*dt;

        this.wb.y=Phaser.Math.Clamp(this.wb.y,30,H-30);
        this.wb.x=Phaser.Math.Clamp(this.wb.x,40,W-40);

        // Scale whale + position tail
        const sc=this.gs();
        this.wb.setScale(sc);
        this.wt.x=this.wb.x-22*sc;
        this.wt.y=this.wb.y;
        this.wt.setScale(sc);

        // Gentle angle tilt
        this.wb.angle=Math.sin(t/500)*2;

        // Bubble trail
        this.rt+=d;
        if(this.rt>90){
            this.rt=0;
            const bx=this.wb.x-20*sc,by=this.wb.y+Phaser.Math.Between(-4,4);
            const bub=this.add.circle(bx,by,Phaser.Math.Between(1,3),0x66ccff,0.3).setDepth(5);
            this.tweens.add({targets:bub,x:bx-50,alpha:0,duration:Phaser.Math.Between(300,600),onComplete:()=>bub.destroy()});
        }

        // Background bubbles float up
        this.bubs.forEach(b=>{b.y-=0.3*dt;if(b.y<-10){b.y=H+10;b.x=Phaser.Math.Between(0,W);}});

        // Depth bar
        const pct=Math.min(this.depth/this.td,1);
        this.dbar.setScale(pct*(W-48),1);
        this.dmrk.setText(this.depth+'m');

        // Combo timeout
        this.ct+=d;if(this.ct>3000)this.combo=0;

        // ── SPAWN ROCKS ──
        // Rocks are ALL deadly. No smashing. Pure dodging.
        // Whale gets bigger = bigger target = harder.
        this.st+=d;
        const rr=Math.max(400,this.lv.rockRate-this.depth*0.3);
        if(this.st>rr&&this.rocks.getChildren().length<this.lv.maxRocks+Math.floor(this.depth/500)){
            this.st=0;
            const rk=['rock-small','rock-med','rock','rock-big'][Phaser.Math.Between(0,3)];
            const r=this.add.image(W+40,Phaser.Math.Between(40,H-40),rk).setDepth(6);
            r.setScale(0.6+Math.random()*0.8);
            r.rotation=Phaser.Math.FloatBetween(-0.4,0.4);
            r.speedX=this.spd+Phaser.Math.FloatBetween(-0.2,1.2);
            // Slight vertical drift to make dodging more interesting
            r.vy=Phaser.Math.FloatBetween(-0.3,0.3);
            this.rocks.add(r);
        }

        // ── SPAWN STARS ──
        this.sst+=d;
        if(this.sst>1500){
            this.sst=0;
            const s=this.add.image(W+30,Phaser.Math.Between(40,H-40),'star').setScale(1.8).setDepth(7);
            s.speedX=this.spd;
            this.tweens.add({targets:s,angle:360,duration:1500,repeat:-1});
            this.stars.add(s);
        }

        // ── SPAWN SHRIMP ──
        this.sht+=d;
        if(this.sht>6000){
            this.sht=0;
            const f=this.add.image(W+30,Phaser.Math.Between(50,H-50),'shrimp').setScale(1.8).setDepth(7);
            f.speedX=this.spd*0.7;
            this.tweens.add({targets:f,y:f.y+10,duration:400,yoyo:true,repeat:-1});
            this.foods.add(f);
        }

        // ── SPAWN JELLYFISH ──
        this.jt+=d;
        if(this.jt>12000){
            this.jt=0;
            const j=this.add.image(W+30,Phaser.Math.Between(50,H-50),'jellyfish').setScale(2.2).setDepth(7);
            j.speedX=this.spd*0.5;
            this.tweens.add({targets:j,y:j.y+15,duration:600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
            this.jellies.add(j);
        }

        // ── MOVE EVERYTHING ──
        this.rocks.getChildren().forEach(r=>{r.x-=r.speedX*dt;r.y+=r.vy*dt;
            if(r.y<30||r.y>H-30)r.vy*=-1;
            if(r.x<-60)r.destroy();});
        this.stars.getChildren().forEach(s=>{s.x-=s.speedX*dt;if(s.x<-40)s.destroy();});
        this.foods.getChildren().forEach(f=>{f.x-=f.speedX*dt;if(f.x<-40)f.destroy();});
        this.jellies.getChildren().forEach(j=>{j.x-=j.speedX*dt;if(j.x<-40)j.destroy();});

        // ── COLLISIONS ──
        const cr=this.gr(); // Whale collision radius — grows with size

        // Rocks = DEATH (always, no smashing)
        this.rocks.getChildren().forEach(r=>{if(!r.active)return;
            const rd=12*r.scaleX; // Rock collision radius based on visual scale
            if(Phaser.Math.Distance.Between(this.wb.x,this.wb.y,r.x,r.y)<cr+rd){
                this.end(false);
            }
        });

        // Stars = score + growth
        this.stars.getChildren().forEach(s=>{if(!s.active)return;
            if(Phaser.Math.Distance.Between(this.wb.x,this.wb.y,s.x,s.y)<cr+12){
                if(s.isTreasure)this.end(true);
                else this.colStar(s);
            }
        });

        // Shrimp = bonus growth
        this.foods.getChildren().forEach(f=>{if(!f.active)return;
            if(Phaser.Math.Distance.Between(this.wb.x,this.wb.y,f.x,f.y)<cr+10)this.colShrimp(f);
        });

        // Jellyfish = speed boost
        this.jellies.getChildren().forEach(j=>{if(!j.active)return;
            if(Phaser.Math.Distance.Between(this.wb.x,this.wb.y,j.x,j.y)<cr+12){
                this.spd=this.lv.speed+2;
                this.time.delayedCall(4000,()=>{if(!this.over)this.spd=this.lv.speed;});
                this.pop(j.x,j.y-15,'⚡ SPEED!');
                this.sparks(j.x,j.y,0x66ffaa);
                j.destroy();
            }
        });
    }

    feed(amount){
        this.fc+=amount;
        const needed=this.fps*this.size;
        if(this.fc>=needed&&this.size<5){
            this.fc=0;this.size++;
            if(this.size>=3)this.wb.setTexture('whale-power');

            // Growth flash
            const ring=this.add.circle(this.wb.x,this.wb.y,10,this.size>=3?0xff6644:0x3399dd,0.4).setDepth(15);
            this.tweens.add({targets:ring,scaleX:8,scaleY:8,alpha:0,duration:500,onComplete:()=>ring.destroy()});

            const label='SIZE '+this.size;
            this.cT.setText(label);this.cT.setAlpha(1).setY(H/2-60);
            this.tweens.add({targets:this.cT,alpha:0,y:this.cT.y-20,duration:1200});
        }
        // Update growth bar
        const pct=Math.min(this.fc/(this.fps*this.size),1);
        this.gbar.setScale(pct*136,1);
        this.gbar.setFillStyle(this.size>=3?0xff6644:this.size>=2?0x44aadd:0x3399dd);
        this.glbl.setText('SIZE '+this.size);
        this.zT.setText('SIZE '+this.size);
        this.zT.setColor(this.size>=3?'#ff6644':this.size>=2?'#88ccff':'#88aacc');
    }

    colStar(s){
        this.combo++;this.ct=0;
        const bonus=10*Math.min(this.combo,5);
        this.score+=bonus;this.sT.setText('⭐ '+this.score);
        this.feed(1);
        if(this.combo>=2){
            this.cT.setText('x'+this.combo);this.cT.setAlpha(1).setY(H/2-100);
            this.tweens.add({targets:this.cT,alpha:0,y:this.cT.y-20,duration:800});
        }
        this.sparks(s.x,s.y,0xffdd44);
        this.pop(s.x,s.y-15,'+'+bonus);
        s.destroy();
    }

    colShrimp(f){
        this.score+=15;this.sT.setText('⭐ '+this.score);
        this.feed(3);
        this.sparks(f.x,f.y,0xff8844);
        this.pop(f.x,f.y-15,'+3 🦐');
        f.destroy();
    }

    sparks(x,y,color){
        const r=this.add.circle(x,y,5,color,0.5).setDepth(15);
        this.tweens.add({targets:r,scaleX:4,scaleY:4,alpha:0,duration:400,onComplete:()=>r.destroy()});
        for(let i=0;i<5;i++){
            const a=(i/5)*Math.PI*2,d=Phaser.Math.Between(10,25);
            const p=this.add.circle(x,y,Phaser.Math.Between(1,3),color,0.8).setDepth(15);
            this.tweens.add({targets:p,x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,alpha:0,duration:350,onComplete:()=>p.destroy()});
        }
    }

    pop(x,y,text){
        const p=this.add.text(x,y,text,{fontSize:'14px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffee66'}).setOrigin(0.5).setDepth(16);
        this.tweens.add({targets:p,y:p.y-25,alpha:0,duration:600,onComplete:()=>p.destroy()});
    }

    end(won){
        this.over=true;this.tailTimer.remove();
        if(won){
            // Save progress
            const pr=JSON.parse(localStorage.getItem('whaleProgress')||'{"unlocked":1,"treasures":[]}');
            if(!pr.treasures.includes(this.li))pr.treasures.push(this.li);
            if(pr.unlocked<=this.li+1)pr.unlocked=this.li+2;
            if(pr.unlocked>5)pr.unlocked=5;
            localStorage.setItem('whaleProgress',JSON.stringify(pr));

            this.add.rectangle(W/2,H/2,W,H,0x000022,0.75).setDepth(30);
            this.add.text(W/2,100,'💎 LEVEL COMPLETE!',{fontSize:'42px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffdd44',stroke:'#442200',strokeThickness:8}).setOrigin(0.5).setDepth(31);
            this.add.text(W/2,170,this.lv.name,{fontSize:'24px',fontFamily:'Courier New',color:this.lv.color}).setOrigin(0.5).setDepth(31);
            this.add.text(W/2,215,'Found: The '+TREASURES[this.li],{fontSize:'20px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffaa22'}).setOrigin(0.5).setDepth(31);
            this.add.text(W/2,260,'⭐ '+this.score+'  |  Size '+this.size,{fontSize:'16px',fontFamily:'Courier New',color:'#aabbcc'}).setOrigin(0.5).setDepth(31);
            if(pr.treasures.length>=5)this.add.text(W/2,300,'🏆 OCEAN RELIC COMPLETE! 🏆',{fontSize:'18px',fontFamily:'Courier New',fontStyle:'bold',color:'#ffdd44'}).setOrigin(0.5).setDepth(31);

            let by=360;
            if(this.li<4){
                const n=this.add.text(W/2,by,'[ NEXT LEVEL ]',{fontSize:'24px',fontFamily:'Courier New',fontStyle:'bold',color:'#66ff88'}).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(31);
                this.tweens.add({targets:n,alpha:0.3,duration:500,yoyo:true,repeat:-1});
                n.on('pointerdown',()=>this.scene.start('Game',{level:this.li+1}));
                by+=45;
            }
            const s=this.add.text(W/2,by,'[ LEVEL SELECT ]',{fontSize:'16px',fontFamily:'Courier New',color:'#88aacc'}).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(31);
            s.on('pointerdown',()=>this.scene.start('LevelSelect'));
        }else{
            // Death — subtle red flash, no screen shake (epilepsy-safe)
            const flash=this.add.rectangle(W/2,H/2,W,H,0xff3333,0.15).setDepth(12);
            this.tweens.add({targets:flash,alpha:0,duration:500,onComplete:()=>flash.destroy()});

            // Scatter particles
            for(let i=0;i<10;i++){
                const a=(i/10)*Math.PI*2;
                const p=this.add.circle(this.wb.x,this.wb.y,Phaser.Math.Between(2,5),0x3399dd,0.7).setDepth(15);
                this.tweens.add({targets:p,x:p.x+Math.cos(a)*Phaser.Math.Between(25,60),y:p.y+Math.sin(a)*Phaser.Math.Between(25,60),alpha:0,duration:600,onComplete:()=>p.destroy()});
            }
            this.wb.setAlpha(0);this.wt.setAlpha(0);

            this.add.rectangle(W/2,H/2,W,H,0x000011,0.8).setDepth(30);
            this.add.text(W/2,140,'WRECKED',{fontSize:'52px',fontFamily:'Courier New',fontStyle:'bold',color:'#ff4444',stroke:'#220000',strokeThickness:8}).setOrigin(0.5).setDepth(31);
            this.add.text(W/2,220,this.depth+'m / '+this.td+'m',{fontSize:'20px',fontFamily:'Courier New',color:'#88ccff'}).setOrigin(0.5).setDepth(31);
            this.add.text(W/2,255,'⭐ '+this.score+'  |  Size '+this.size,{fontSize:'16px',fontFamily:'Courier New',color:'#aabbcc'}).setOrigin(0.5).setDepth(31);

            const r=this.add.text(W/2,320,'[ RETRY ]',{fontSize:'24px',fontFamily:'Courier New',fontStyle:'bold',color:'#66ff88'}).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(31);
            this.tweens.add({targets:r,alpha:0.3,duration:500,yoyo:true,repeat:-1});
            r.on('pointerdown',()=>this.scene.start('Game',{level:this.li}));

            const m=this.add.text(W/2,370,'[ LEVEL SELECT ]',{fontSize:'16px',fontFamily:'Courier New',color:'#88aacc'}).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(31);
            m.on('pointerdown',()=>this.scene.start('LevelSelect'));
        }
    }
}

new Phaser.Game({
    type:Phaser.AUTO,width:W,height:H,parent:'game-container',
    backgroundColor:'#060620',
    scene:[Preload,Title,LevelSelect,Game],
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    audio:{disableWebAudio:false},
    pixelArt:true
});
