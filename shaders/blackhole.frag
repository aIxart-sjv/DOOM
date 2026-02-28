#version 330

out vec4 fragColor;

uniform sampler2D star_tex;
uniform vec2 resolution;

void main()
{
    //----------------------------------
    // SCREEN → NORMALIZED COORDS
    //----------------------------------
    vec2 uv =
        (gl_FragCoord.xy / resolution) * 2.0 - 1.0;

    uv.x *= resolution.x / resolution.y;

    //----------------------------------
    // CAMERA SETUP
    //----------------------------------
    vec3 cam_pos = vec3(0.0, 0.0, -3.0);

    vec3 ray_dir =
        normalize(vec3(uv, 1.5));

    //----------------------------------
    // BLACK HOLE POSITION
    //----------------------------------
    vec3 bh_pos = vec3(0.0);

    vec3 to_bh = bh_pos - cam_pos;

    //----------------------------------
    // DISTANCE FROM RAY TO BH
    //----------------------------------
    float t =
        dot(to_bh, ray_dir);

    vec3 closest =
        cam_pos + ray_dir * t;

    float dist =
        length(closest - bh_pos);

    //----------------------------------
    // GRAVITATIONAL DEFLECTION
    //----------------------------------
    float bend =
        0.15 / (dist + 0.3);

    ray_dir =
        normalize(ray_dir +
        normalize(bh_pos - closest) * bend);

    //----------------------------------
    // SKY SAMPLING
    //----------------------------------
    vec2 skyUV =
        ray_dir.xy * 0.5 + 0.5;

    vec3 color =
        texture(star_tex, skyUV).rgb;

    //----------------------------------
    // EVENT HORIZON
    //----------------------------------
    if(dist < 0.25)
        color = vec3(0.0);

    //----------------------------------
    fragColor = vec4(color, 1.0);
}