from fastapi import FastAPI
import subprocess
import asyncio

app = FastAPI()

async def run_script(path):
    process = await asyncio.create_subprocess_exec(
        "python", path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()
    return stdout.decode()

@app.get("/")
def root():
    return {"status": "PiRC Extended Running"}

@app.get("/simulation/full")
async def full_simulation():
    result = await run_script("scripts/run_full_simulation.py")
    return {"result": result}

@app.get("/simulation/sybil")
async def sybil_test():
    result = await run_script("simulations/sybil_vs_trust_graph.py")
    return {"result": result}

@app.get("/simulation/atas")
async def atas_test():
    result = await run_script("simulations/atas_simulation.py")
    return {"result": result}
