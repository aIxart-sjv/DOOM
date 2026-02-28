#version 330

out vec4 fragColor;

uniform sampler2D star_tex;
uniform vec2 resolution;
uniform float time;

void main()
{
    //----------------------------------
    // SCREEN → NORMALIZED SPACE
    //----------------------------------
    vec2 uv =
        (gl_FragCoord.xy / resolution) * 2.0 - 1.0;

    uv.x *= resolution.x / resolution.y;

    //----------------------------------
    // ORBITING CAMERA
    //----------------------------------
    float radius = 3.0;

    vec3 cam_pos = vec3(
        sin(time * 0.3) * radius,
        0.6,
        cos(time * 0.3) * radius
    );

    //----------------------------------
    // CAMERA BASIS
    //----------------------------------
    vec3 forward = normalize(-cam_pos);
    vec3 right   = normalize(cross(vec3(0,1,0), forward));
    vec3 up      = cross(forward, right);

    vec3 ray_dir =
        normalize(
            forward +
            uv.x * right +
            uv.y * up
        );

    //----------------------------------
    // BLACK HOLE POSITION
    //----------------------------------
    vec3 bh_pos = vec3(0.0);

    vec3 to_bh = bh_pos - cam_pos;

    float t = dot(to_bh, ray_dir);

    vec3 closest =
        cam_pos + ray_dir * t;

    float dist =
        length(closest - bh_pos);

    //----------------------------------
    // GRAVITATIONAL LENSING
    //----------------------------------
    float bend =
        0.18 / (dist + 0.35);

    ray_dir =
        normalize(
            ray_dir +
            normalize(bh_pos - closest) * bend
        );

    //----------------------------------
    // ACCRETION DISK (RELATIVISTIC)
    //----------------------------------
    vec3 disk_color = vec3(0.0);

    float plane_y = 0.0;
    float denom = ray_dir.y;

    if(abs(denom) > 0.0001)
    {
        float t_disk =
            (plane_y - cam_pos.y) / denom;

        if(t_disk > 0.0)
        {
            vec3 hit =
                cam_pos + ray_dir * t_disk;

            float r_disk =
                length(hit.xz);

            if(r_disk > 0.4 && r_disk < 1.3)
            {
                //----------------------------------
                // ORBIT VELOCITY
                //----------------------------------
                vec3 tangent =
                    normalize(vec3(
                        -hit.z,
                         0.0,
                         hit.x
                    ));

                //----------------------------------
                // VIEW DIRECTION
                //----------------------------------
                vec3 view_dir =
                    normalize(cam_pos - hit);

                //----------------------------------
                // DOPPLER BOOST
                //----------------------------------
                float doppler =
                    dot(tangent, view_dir);

                float brightness =
                    1.0 + doppler * 2.5;

                brightness =
                    clamp(brightness, 0.2, 3.5);

                //----------------------------------
                // DISK PROFILE
                //----------------------------------
                float glow =
                    exp(-5.0 *
                    abs(r_disk - 0.7));

                //----------------------------------
                disk_color =
                    vec3(1.8, 0.9, 0.3)
                    * glow
                    * brightness;
            }
        }
    }

    //----------------------------------
    // SKY SAMPLING
    //----------------------------------
    vec2 skyUV =
        ray_dir.xy * 0.5 + 0.5;

    vec3 stars =
        texture(star_tex, skyUV).rgb;

    //----------------------------------
    // EVENT HORIZON
    //----------------------------------
    if(dist < 0.25)
        stars = vec3(0.0);

    //----------------------------------
    // PHOTON RING
    //----------------------------------
    float photon_radius = 0.28;

    float photon_ring =
        exp(-120.0 * abs(dist - photon_radius));

    //----------------------------------
    // GRAVITATIONAL REDSHIFT
    //----------------------------------
    float redshift =
        clamp((dist - 0.25) * 2.0, 0.0, 1.0);

    // shift toward red near horizon
    vec3 red_tint =
        vec3(1.0, 0.3, 0.1);

    stars =
        mix(red_tint * length(stars),
            stars,
            redshift);

    disk_color =
        mix(red_tint * length(disk_color),
            disk_color,
            redshift);

    vec3 photon_color =
        vec3(2.5, 1.6, 0.6) * photon_ring;

    //----------------------------------
    // FINAL COLOR
    //----------------------------------
    vec3 color =
        stars +
        disk_color +
        photon_color;

    fragColor = vec4(color, 1.0);
}