let e=null,t=null,n=null;const r=/* @__PURE__ */ new Set,i=self;function a(t,n){let r=`/work/`+t;if(e.FS.mkdirTree(r.slice(0,r.lastIndexOf(`/`))),n.startsWith(`base64:`)){let t=atob(n.slice(7)),i=new Uint8Array(t.length);for(let e=0;e<t.length;e++)i[e]=t.charCodeAt(e);e.FS.writeFile(r,i)}else e.FS.writeFile(r,n)}i.onmessage=async o=>{let s=o.data;try{if(s.type===`init`){n=(async()=>{e=await(await import(
/* @vite-ignore */
s.indexURL+`pyodide.mjs`)).loadPyodide({indexURL:s.indexURL,...s.packageBaseUrl?{packageBaseUrl:s.packageBaseUrl}:{}}),e.FS.mkdirTree(`/work`),e.runPython(`
import builtins, io, os, sys, traceback

def _run_case(source, args, stdin_text, local_imports=False):
    out_b, err_b = io.BytesIO(), io.BytesIO()
    out = io.TextIOWrapper(out_b, encoding="utf-8", newline="\\n", write_through=True)
    err = io.TextIOWrapper(err_b, encoding="utf-8", newline="\\n", write_through=True)
    saved = (sys.stdout, sys.stderr, sys.stdin, sys.argv, list(sys.path), set(sys.modules), os.getcwd())
    sys.stdout, sys.stderr, sys.stdin = out, err, io.StringIO(stdin_text)
    sys.argv = [source, *args]
    code = 0
    sys.setrecursionlimit(500)
    try:
        os.chdir("/work")
        if local_imports:
            sys.path.insert(0, os.path.dirname(os.path.abspath(source)))
        with open(source, encoding="utf-8") as handle:
            text = handle.read()
        scope = {"__name__": "__main__", "__file__": source, "__builtins__": builtins}
        try:
            exec(compile(text, source, "exec"), scope)
        except SystemExit as stop:
            if stop.code is None:
                code = 0
            elif isinstance(stop.code, int):
                code = stop.code
            else:
                print(stop.code, file=sys.stderr)
                code = 1
        except BaseException as exc:
            tb = exc.__traceback__
            while tb is not None and tb.tb_frame.f_code.co_filename != source:
                tb = tb.tb_next
            traceback.print_exception(type(exc), exc, tb if tb is not None else exc.__traceback__, file=sys.stderr)
            code = 1
    finally:
        try:
            sys.stdout.flush(); sys.stderr.flush()
        except Exception:
            pass
        sys.stdout, sys.stderr, sys.stdin, sys.argv = saved[0], saved[1], saved[2], saved[3]
        sys.path[:] = saved[4]
        for name in set(sys.modules) - saved[5]:
            origin = getattr(sys.modules.get(name), "__file__", None) or ""
            if origin.startswith("/work") or name == "__main__":
                sys.modules.pop(name, None)
        os.chdir(saved[6])
    return [code, out_b.getvalue().decode("utf-8", "replace"), err_b.getvalue().decode("utf-8", "replace")]
`),t=e.globals.get(`_run_case`)})(),await n;let r=String(e.runPython(`import sys; sys.version.split()[0]`));i.postMessage({type:`ready`,version:r})}else if(s.type===`files`){if(await n,!r.has(s.module)){for(let[e,t]of Object.entries(s.files))a(e,t);r.add(s.module)}i.postMessage({type:`files-ready`,module:s.module})}else if(s.type===`run`){await n,a(s.source,s.code);try{await e.loadPackagesFromImports(s.code,{messageCallback(){},errorCallback(){}})}catch{}let r=t,o=await(r.callPromising?r.callPromising(s.source,s.args,s.stdin,s.localImports):Promise.resolve(r(s.source,s.args,s.stdin,s.localImports))),[c,l,u]=`toJs`in o&&o.toJs?o.toJs():o;i.postMessage({type:`result`,id:s.id,code:c,stdout:l,stderr:u})}}catch(e){let t=s.type===`run`?s.id:-1;i.postMessage({type:`fatal`,id:t,message:String(e).split(`
`).slice(-6).join(`
`)})}};