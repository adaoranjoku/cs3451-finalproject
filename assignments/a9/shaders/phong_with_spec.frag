#version 330 core

/*default camera matrices. do not modify.*/
layout(std140) uniform camera
{
    mat4 projection;	/*camera's projection matrix*/
    mat4 view;			/*camera's view matrix*/
    mat4 pvm;			/*camera's projection*view*model matrix*/
    mat4 ortho;			/*camera's ortho projection matrix*/
    vec4 position;		/*camera's position in world space*/
};

/* set light ubo. do not modify.*/
struct light
{
	ivec4 att; 
	vec4 pos; // position
	vec4 dir;
	vec4 amb; // ambient intensity
	vec4 dif; // diffuse intensity
	vec4 spec; // specular intensity
	vec4 atten;
	vec4 r;
};
layout(std140) uniform lights
{
	vec4 amb;
	ivec4 lt_att; // lt_att[0] = number of lights
	light lt[4];
};

/*input variables*/
in vec3 vtx_normal; // vtx normal in world space
in vec3 vtx_position; // vtx position in world space
in vec3 vtx_model_position; // vtx position in model space
in vec4 vtx_color;
in vec2 vtx_uv;
in vec3 vtx_tangent;

uniform vec3 ka;            /* object material ambient */
uniform vec3 kd;            /* object material diffuse */
uniform vec3 ks;            /* object material specular */
uniform float shininess;    /* object material shininess */

uniform sampler2D tex_color;   /* texture sampler for color */
uniform sampler2D tex_normal;   /* texture sampler for normal vector */
uniform sampler2D tex_specular;

/*output variables*/
out vec4 frag_color;

//const light light1 = light(/*att*/ ivec4(0), 
//                            /*pos*/ vec4(3, 1, 3, 0), 
//                            /*dir*/ vec4(0.1, 0.1, 0.1, 0.), 
//                            /*amb*/ vec4(0.1, 0.1, 0.1, 0.), 
//                            /*dif*/ vec4(1.0, 1.0, 1.0, 0.), 
//                            /*spec*/ vec4(0.5, 0.5, 0.5, 0.),
//                            /*atten*/ vec4(0.1, 0.1, 0.1, 0.), 
//                            /*r*/ vec4(0.1, 0.1, 0.1, 0.));
//
vec4 shading_texture_with_phong(light li, vec3 e, vec3 p, vec3 n)
{
    vec3 color = vec3(0.0);                                 //// we set the default color to be black, update its value in your implementation below
    vec3 tex_color = texture(tex_color, vtx_uv).rgb;      //// the texture value read from your previously implemented function; you need to use this value in your phong shading model
    float tex_spec = texture(tex_specular, vtx_uv).r;
    
    /* your implementation starts */
    vec3 l = normalize(li.pos.xyz - p);
    n = normalize(n);
    vec3 v = normalize(e - p);
    vec3 r = normalize(reflect(-l, n));
    color = vec3(li.amb.rgb * ka * tex_color
        + li.dif.rgb * kd * max(0, dot(l, n)) * tex_color
        + li.spec.rgb * ks * pow(max(0, dot(v, r)), shininess) * tex_spec);

    /* your implementation ends */

    return vec4(color, 1.f);
}

vec3 read_normal_texture()
{
    vec3 normal = texture(tex_normal, vtx_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    return normal;
}

float read_specular_texture()
{
    float specular = texture(tex_specular, vtx_uv).r;
    return specular;
}
    

void main()
{
    vec3 e = position.xyz;              //// eye position
    vec3 p = vtx_position;              //// surface position
    vec3 N = normalize(vtx_normal);     //// normal vector
    vec3 T = normalize(vtx_tangent);    //// tangent vector

    vec3 texture_normal = read_normal_texture();
    vec3 texture_color = texture(tex_color, vtx_uv).rgb;

    frag_color = shading_texture_with_phong(lt[0], e, p, N);
    frag_color += shading_texture_with_phong(lt[1], e, p, N);
    frag_color += shading_texture_with_phong(lt[2], e, p, N);
}