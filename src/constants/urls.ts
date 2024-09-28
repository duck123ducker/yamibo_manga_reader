export const LOGIN_URL = 'https://bbs.yamibo.com/member.php?mod=logging&action=login&mobile=2'

export const NO_CACHE_LIST = [ 'action=login', 'action=rate' ]

export const getMobileThreadUrl = (tid: string) => `https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${tid}&mobile=2`;

export const getMenuUrl = (id: string) => `https://bbs.yamibo.com/misc.php?mod=tag&id=${id}&type=thread&page=1&forcemobile=1`
