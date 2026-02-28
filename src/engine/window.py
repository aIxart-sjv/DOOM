import moderngl_window as mglw
import moderngl as mgl
import numpy as np
from PIL import Image


class DoomWindow(mglw.WindowConfig):

    gl_version = (3, 3)
    title = "DOOM Engine"
    window_size = (1000, 700)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # -------------------------------------------------
        # SHADER PROGRAM
        # -------------------------------------------------
        self.program = self.ctx.program(
            vertex_shader=open(
                "shaders/vertex.glsl",
                encoding="utf-8"
            ).read(),

            fragment_shader=open(
                "shaders/blackhole.frag",
                encoding="utf-8"
            ).read(),
        )

        # -------------------------------------------------
        # FULLSCREEN QUAD
        # -------------------------------------------------
        quad_vertices = np.array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ], dtype="f4")

        quad = self.ctx.buffer(quad_vertices.tobytes())

        self.vao = self.ctx.simple_vertex_array(
            self.program,
            quad,
            "in_vert"
        )

        # -------------------------------------------------
        # LOAD STARFIELD TEXTURE
        # -------------------------------------------------
        img = Image.open(
            "assets/textures/stars.jpg"
        ).transpose(Image.FLIP_TOP_BOTTOM)

        self.texture = self.ctx.texture(
            img.size,
            3,
            img.tobytes()
        )

        self.texture.build_mipmaps()
        self.texture.repeat_x = True
        self.texture.repeat_y = True
        self.texture.use(0)

        # connect shader sampler
        self.program["star_tex"] = 0

        # -------------------------------------------------
        # INITIAL UNIFORMS
        # -------------------------------------------------
        self.program["resolution"].value = self.wnd.size

        self.program["time"] = 0.0
    # -------------------------------------------------
    # RENDER LOOP
    # -------------------------------------------------
    def on_render(self, time, frame_time):

        self.ctx.clear(0.0, 0.0, 0.0)

        # update resolution dynamically
        self.program["resolution"].value = self.wnd.size
        self.program["time"].value = time
        self.vao.render(mgl.TRIANGLE_STRIP)