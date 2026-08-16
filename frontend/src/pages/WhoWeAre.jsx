import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, TEAM } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function WhoWeAre() {
  useSeo('Who We Are', `The doctors and medical students behind ${BRAND.name}.`);

  return (
    <main className="page">
      <h1 className="page-h1 who-h1">{TEAM.headline}</h1>

      <div className="team-photo-wrap">
        <Img className="team-photo" src={TEAM.groupPhoto} alt="" label="The Doc. to Doc. team" />
      </div>

      <h2 className="who-intro">{TEAM.intro}</h2>
      <p className="who-body">{TEAM.body}</p>

      <div className="team-grid">
        {TEAM.members.map((m) => (
          <div className="team-card" key={m.name}>
            <Img className="team-avatar" src={m.photo} alt={m.name} label={m.name} />
            <h3 className="team-name">{m.name}</h3>
            <p className="team-meta">{m.country}<br />{m.role}</p>
            <p className="team-quote">“{m.quote}”</p>
            <p className="team-bio">{m.bio}</p>
            <p className="team-tag">{m.tag}</p>
          </div>
        ))}
      </div>

      <div className="steps-cta">
        <Link to="/book" className="btn btn-commerce">Talk to us →</Link>
      </div>
    </main>
  );
}
