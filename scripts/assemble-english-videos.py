from pathlib import Path
import argparse,json,math,re,subprocess
parser=argparse.ArgumentParser(description='Build continuous English videos without truncating source audio.')
parser.add_argument('--ffmpeg',default='ffmpeg')
parser.add_argument('--kind',choices=['live','meds','drink'],nargs='+',default=['live','meds','drink'])
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
sequences={'live':['Timo1.mp4','Hilma2.mp4','Timo3.mp4','Hilma4.mp4','Timo5.mp4','Hilma6.mp4','Timo7.mp4','Hilma8.mp4'],'meds':['Timolaake1.mp4','Hilmalaake2.mp4','Timolaake3.mp4','Hilmalaake4.mp4','Timolaake5.mp4','Hilmalaake6.mp4','Timolaake7.mp4','Hilmalaake8.mp4'],'drink':['Timojuo1.mp4','Hilmajuo2.mp4','Timmojuo3.mp4']}
timeline=root/'public/media/en/timelines.json'
metadata=json.loads(timeline.read_text(encoding='utf-8')) if timeline.exists() else {}
for kind,files in sequences.items():
 if kind not in args.kind:continue
 command=[args.ffmpeg,'-y','-hide_banner','-loglevel','error','-filter_complex_threads','1'];filters=[];total=0;boundaries=[]
 for i,file in enumerate(files):
  source=root/'public/media/en'/kind/file
  packets=subprocess.check_output([args.ffmpeg,'-v','error','-i',str(source),'-map','0:a:0','-c','copy','-f','framehash','-'],text=True)
  timebase=0;end=0
  for line in packets.splitlines():
   if line.startswith('#tb '):
    match=re.search(r'(\d+)/(\d+)',line);timebase=int(match[1])/int(match[2])
   elif line and not line.startswith('#'):
    fields=line.split(',');end=max(end,(int(fields[2])+int(fields[3]))*timebase)
  duration=math.ceil((end+.12)*30)/30
  command+=['-threads','1','-i',str(source)]
  filters.append(f'[{i}:v:0]scale=832:1104:force_original_aspect_ratio=decrease,pad=832:1104:(ow-iw)/2:(oh-ih)/2:color=0xeef7f3,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=1,trim=duration={duration},setpts=PTS-STARTPTS[v{i}]')
  filters.append(f'[{i}:a:0]aresample=48000,apad,atrim=duration={duration},asetpts=PTS-STARTPTS[a{i}]')
  boundaries.append({'file':file,'start':round(total,4),'end':round(total+duration,4),'sourceAudioEnd':round(end,4)});total+=duration
 filters.append(''.join(f'[v{i}][a{i}]' for i in range(len(files)))+f'concat=n={len(files)}:v=1:a=1[v][a]')
 target=root/'public/media/en'/{'live':'live-conversation.mp4','meds':'medication-reminder.mp4','drink':'hydration-reminder.mp4'}[kind]
 command+=['-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(target)]
 subprocess.run(command,check=True)
 metadata[kind]={'file':target.name,'duration':round(total,4),'boundaries':boundaries}
(root/'public/media/en/timelines.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
