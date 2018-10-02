1) I started working on HW1 after I finished  the book <<ray tracing in one weekend>>.so there are some classes with the sanme names.
   I created those class in order to make this homework to be more flexible ,maybe I can working on HW2 base on this.

2) I set the width and height of canvas as 256 as default.It will take a bit longer if I make them bigger.
3) There have some radios on the top part of index.html. we can click those radios to jump to the different parts of HW1, like a hotlink.
   Part1 Using ray casting, render unlit, colored spheres
   Part2 Using ray casting, render lit spheres
   Extra1: Arbitrarily sized images and viewports   Af we click this radio, the window size will change to 400*300
   Extra2: Support arbitrary viewing setups   After click this, the lookat will be (0.75,0.75,0.5) ,or we can input che headup,lookat,ect handly
   Extra3: Support off-axis and rectangular projections  I set the heigt/width to 2; or we can input handly. Be careful of theose inputs, or we can not find those spheres.
   Extra4: Multiple and arbitrarily located lights  A light at (0,0,0) will be added automaticly if we click this radio. or we can add a light by click a button named"addlight"
           and we can remove the last added light by click button "remove last added light"
   Extra5: Detect shadows during ray casting.we will see the shadow on the red sphere.
   Extra6: Extra credit: Render triangles .While I am rendering triangles, 
           I use the algorithm from this paper,but not codes(http://www.cs.virginia.edu/~gfx/Courses/2003/ImageSynthesis/papers/Acceleration/Fast%20MinimumStorage%20RayTriangle%20Intersection.pdf)
           
   