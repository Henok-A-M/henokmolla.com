
/* PROJECT FOLDER CONTROLLER
   Edit projects[] to change README content. The first three entries are
   existing labs/home lab; the next ten are future project placeholders.
   Button data-project indexes must match array positions.
   Only document a project as completed after doing the work.
*/
(()=>{const projects=[{"folder":"vlan-segmentation","title":"VLAN Network Segmentation","desc":"Created VLANs 10, 20, and 30 in Cisco Packet Tracer and practiced switch configuration. Access-port assignments and network isolation are not yet verified by the saved screenshots.","tags":["Cisco Packet Tracer","VLANs","Network Segmentation"]},{"folder":"wireshark-analysis","title":"Wireshark Security Analysis","desc":"Analyzed TCP connections, IP communication, and packet behavior in controlled C2 and simulated DDoS security labs. The displayed screenshots document the C2 exercise.","tags":["Wireshark","TCP/IP","Packet Analysis"]},{"folder":"home-lab","title":"My Home Lab","desc":"Built a personal home lab to practice networking, server management, troubleshooting, and network configuration. Documentation of the setup and results is ongoing.","tags":["Home Lab","Active / Documentation Ongoing","Networking","Infrastructure"]},{"folder":"windows-security-logs","title":"Windows Security Log Monitoring","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"wireshark-traffic-analysis","title":"Network Traffic Analysis with Wireshark","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"entra-id-access","title":"User Access Management in Entra ID","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"nessus-vulnerability-scan","title":"Vulnerability Scanning with Nessus","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"sentinel-siem-monitoring","title":"SIEM Monitoring with Microsoft Sentinel","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"phishing-investigation","title":"Phishing Email Investigation","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"virustotal-ip-reputation","title":"IP Reputation Analysis with VirusTotal","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"linux-system-hardening","title":"Linux System Hardening","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"incident-response-playbook","title":"Incident Response Playbook","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]},{"folder":"firewall-configuration","title":"Firewall Configuration","desc":"Future cybersecurity practice project. This folder is a placeholder for the project plan, tools, implementation steps, screenshots, findings, and lessons learned once completed.","tags":["Planned","Future Project"]}];
const panels=[...document.querySelectorAll('.project-panel')];
document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>{
 const p=projects[Number(btn.dataset.project)];if(!p)return;
 document.querySelectorAll('[data-project]').forEach(b=>{const selected=b===btn;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
 const panelName=(p.folder==='vlan-segmentation'||p.folder==='wireshark-analysis')?p.folder:'other';
 panels.forEach(panel=>{
   const selected=panel.dataset.panel===panelName;
   panel.hidden=!selected;
   if(selected){
     panel.classList.remove('panel-arrive');
     void panel.offsetWidth;
     panel.classList.add('panel-arrive');
   }
 });
 if(panelName==='other'){
  document.getElementById('file-title').textContent=p.folder+'/README.md';
  document.getElementById('command').textContent='cat '+p.folder+'/README.md';
  document.getElementById('project-title').textContent=p.title;
  document.getElementById('project-desc').textContent=p.desc;
  const tags=document.getElementById('project-tags');
  tags.replaceChildren(...p.tags.map(t=>{const span=document.createElement('span');span.className='filetag';span.textContent=t;return span;}));
 }
 const panel=document.getElementById('panel-'+panelName);
 if(panel){const details=panel.querySelector('details');if(details)details.open=true;}
}));})();
