from PIL import Image


class BlackHole:
    def __init__(self, ctx):
        self.ctx = ctx

        self.prog = ctx.program(
            vertex_shader=open("shaders/vertex.glsl").read(),
            fragment_shader=open("shaders/blackhole.frag").read(),
        )

        # FULLSCREEN QUAD
        quad = ctx.buffer(
            data=b'-1 -1  1 -1  -1 1  1 1'
        )

        self.vao = ctx.simple_vertex_array(
            self.prog, quad, "in_vert")

        # LOAD STAR TEXTURE
        img = Image.open("assets/textures/stars.jpg").transpose(Image.FLIP_TOP_BOTTOM)

        self.texture = ctx.texture(
            img.size,
            3,
            img.tobytes()
        )

        self.texture.build_mipmaps()
        self.texture.use(0)

        self.prog["star_tex"] = 0

    def render(self, time):
        self.prog["time"].value = time
        self.vao.render()